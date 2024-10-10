
# Elegant Chat Application

Welcome to the **Go Chat** project, a modern chat application built with Go for the backend and a clean, minimalist frontend using Tailwind CSS. This application provides a seamless chatting experience with real-time messaging capabilities. **Please note that this is a proof of concept project designed to help me learn about WebSockets, so it is a bare-bones implementation.**

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)

## Features

- User login with username
- Real-time messaging between users
- Display of online users
- Simple and elegant UI with a minimalist design
- Message history retrieval

## Technologies Used

- **Go**: Backend programming language
- **WebSockets**: For real-time communication
- **Tailwind CSS**: For styling the frontend
- **SQLite**: Lightweight database to store user data and messages

## Project Structure

```
chat
├── chat.db                # SQLite database file
├── go.mod                 # Go module file
├── go.sum                 # Go module dependencies
├── main.go                # Main application file
├── public                 # Directory for public assets (HTML, CSS, etc.)
├── tailwind.config.js     # Tailwind CSS configuration file
└── tmp                    # Temporary files and resources
```

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/Chat-Application.git
   cd Chat-Application
   ```

2. **Install Go dependencies**:

   Ensure you have [Go](https://golang.org/dl/) installed, then run:

   ```bash
   go mod tidy
   ```


## Usage

1. **Start the Go server**:

   In the terminal, run:

   ```bash
   go run main.go
   ```

   The application will be running at `http://localhost:8080`.

2. **Open the chat application**:

   Open your web browser and go to `http://localhost:8080` to access the chat interface.

3. **Log in and start chatting**:

   Enter your username in one browser, and open a separate browser window (with a different username) to initiate the conversation.

