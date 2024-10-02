package main

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]string)
var users = make(map[string]*websocket.Conn)
var db *sql.DB

type Message struct {
	Type      string    `json:"type"`
	Sender    string    `json:"sender"`
	Recipient string    `json:"recipient"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type UserListMessage struct {
	Type  string   `json:"type"`
	Users []string `json:"users"`
}

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./chat.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = createTables()
	if err != nil {
		log.Fatal(err)
	}

	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)
	http.HandleFunc("/ws", handleConnections)

	log.Println("Starting server on http://localhost:8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func createTables() error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			username TEXT PRIMARY KEY,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender TEXT,
			recipient TEXT,
			message TEXT,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (sender) REFERENCES users(username),
			FOREIGN KEY (recipient) REFERENCES users(username)
		);
	`)
	return err
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			delete(users, clients[ws])
			broadcastUserList()
			break
		}

		switch msg.Type {
		case "login":
			handleLogin(ws, msg.Sender)
		case "message":
			handleMessage(msg)
		case "getHistory":
			sendMessageHistory(ws, msg.Sender, msg.Recipient)
		}
	}
}

func handleLogin(ws *websocket.Conn, username string) {
	_, err := db.Exec("INSERT OR IGNORE INTO users (username) VALUES (?)", username)
	if err != nil {
		log.Printf("error registering user: %v", err)
		return
	}

	clients[ws] = username
	users[username] = ws

	broadcastUserList()
	sendUserList(ws)
}

func handleMessage(msg Message) {
	msg.Timestamp = time.Now()

	recipientConn, ok := users[msg.Recipient]
	if ok {
		err := recipientConn.WriteJSON(msg)
		if err != nil {
			log.Printf("error: %v", err)
			recipientConn.Close()
			delete(clients, recipientConn)
			delete(users, msg.Recipient)
		}
	}

	_, err := db.Exec("INSERT INTO messages (sender, recipient, message, timestamp) VALUES (?, ?, ?, ?)",
		msg.Sender, msg.Recipient, msg.Message, msg.Timestamp)
	if err != nil {
		log.Printf("error storing message: %v", err)
	}
}

func broadcastUserList() {
	userList := getUserList()
	userListMsg := UserListMessage{
		Type:  "userList",
		Users: userList,
	}

	for _, conn := range users {
		err := conn.WriteJSON(userListMsg)
		if err != nil {
			log.Printf("error: %v", err)
			conn.Close()
			delete(clients, conn)
			delete(users, clients[conn])
		}
	}
}

func sendUserList(ws *websocket.Conn) {
	userList := getUserList()
	userListMsg := UserListMessage{
		Type:  "userList",
		Users: userList,
	}

	err := ws.WriteJSON(userListMsg)
	if err != nil {
		log.Printf("error sending user list: %v", err)
	}
}

func getUserList() []string {
	userList := make([]string, 0, len(users))
	for user := range users {
		userList = append(userList, user)
	}
	return userList
}

func sendMessageHistory(ws *websocket.Conn, sender, recipient string) {
	rows, err := db.Query(`
		SELECT sender, recipient, message, timestamp
		FROM messages
		WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)
		ORDER BY timestamp
	`, sender, recipient, recipient, sender)
	if err != nil {
		log.Printf("error querying message history: %v", err)
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(&msg.Sender, &msg.Recipient, &msg.Message, &msg.Timestamp)
		if err != nil {
			log.Printf("error scanning message row: %v", err)
			continue
		}
		msg.Type = "message"
		messages = append(messages, msg)
	}

	historyMsg := struct {
		Type     string    `json:"type"`
		Messages []Message `json:"messages"`
	}{
		Type:     "history",
		Messages: messages,
	}

	err = ws.WriteJSON(historyMsg)
	if err != nil {
		log.Printf("error sending message history: %v", err)
	}
}
