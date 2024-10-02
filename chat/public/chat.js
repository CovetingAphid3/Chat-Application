let socket;
let currentUser;
let selectedUser;

function login() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        currentUser = username;
        socket = new WebSocket('ws://localhost:8080/ws');
        
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'login', sender: username }));
            document.getElementById('login').classList.add('hidden');
            document.getElementById('chat').classList.remove('hidden');
            document.getElementById('chat').classList.add('animate-fade-in');
        };

        socket.onmessage = handleMessage;
    }
}

function handleMessage(event) {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'userList':
            updateUserList(data.users);
            break;
        case 'message':
            displayMessage(data);
            break;
        case 'history':
            displayMessageHistory(data.messages);
            break;
    }
}

function updateUserList(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '<h2 class="text-xl font-semibold text-white mb-4">Contacts</h2>';
    users.forEach((user, index) => {
        if (user !== currentUser) {
            const userElement = createUserElement(user, index);
            userList.appendChild(userElement);
        }
    });
}

function createUserElement(user, index) {
    const userElement = document.createElement('div');
    userElement.className = 'flex items-center space-x-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-10 cursor-pointer transition duration-300 transform hover:scale-105';
    userElement.style.animationDelay = `${index * 100}ms`;
    userElement.classList.add('animate-fade-in-up');
    userElement.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            ${user.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1">
            <h3 class="text-white font-semibold">${user}</h3>
            <p class="text-white text-opacity-70 text-sm">Online</p>
        </div>
    `;
    userElement.onclick = () => selectUser(user);
    return userElement;
}

function selectUser(user) {
    selectedUser = user;
    document.getElementById('message-list').innerHTML = '';
    document.getElementById('selected-user').textContent = user;
    socket.send(JSON.stringify({ type: 'getHistory', sender: currentUser, recipient: selectedUser }));
    
    // Update UI to show selected user
    const userElements = document.querySelectorAll('#user-list > div');
    userElements.forEach(el => el.classList.remove('bg-white', 'bg-opacity-10'));
    event.target.closest('div').classList.add('bg-white', 'bg-opacity-10');
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    if (message && selectedUser) {
        socket.send(JSON.stringify({
            type: 'message',
            sender: currentUser,
            recipient: selectedUser,
            message: message
        }));
        messageInput.value = '';
        displayMessage({ sender: currentUser, message: message, timestamp: new Date().toISOString() });
    }
}

function displayMessage(message) {
    const messageList = document.getElementById('message-list');
    const messageElement = createMessageElement(message);
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
    
    // Trigger animation
    setTimeout(() => {
        messageElement.classList.remove('opacity-0');
        messageElement.classList.remove('translate-y-2');
    }, 10);
}

function createMessageElement(message) {
    const messageElement = document.createElement('div');
    const isCurrentUser = message.sender === currentUser;
    messageElement.className = `max-w-[70%] ${isCurrentUser ? 'ml-auto' : 'mr-auto'} bg-gradient-to-br ${isCurrentUser ? 'from-purple-500 to-indigo-500' : 'from-gray-500 to-gray-600'} rounded-lg p-3 shadow-md transition duration-300 transform opacity-0 translate-y-2`;
    
    const innerHtml = `
        <div class="font-semibold text-white text-sm mb-1">${isCurrentUser ? 'You' : message.sender}</div>
        <div class="text-white">${message.message}</div>
        <div class="text-xs text-white text-opacity-70 mt-1 text-right">${new Date(message.timestamp).toLocaleTimeString()}</div>
    `;
    
    messageElement.innerHTML = innerHtml;
    return messageElement;
}

function displayMessageHistory(messages) {
    const messageList = document.getElementById('message-list');
    messageList.innerHTML = '';
    messages.forEach((message, index) => {
        setTimeout(() => displayMessage(message), index * 100);
    });
}

// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', (event) => {
    const messageInput = document.getElementById('message');
    const sendButton = document.querySelector('button[onclick="sendMessage()"]');

    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    messageInput.addEventListener('input', function (e) {
        if (this.value.trim() !== '') {
            sendButton.classList.remove('opacity-50', 'cursor-not-allowed');
            sendButton.removeAttribute('disabled');
        } else {
            sendButton.classList.add('opacity-50', 'cursor-not-allowed');
            sendButton.setAttribute('disabled', 'disabled');
        }
    });
});

// Add these utility functions at the end of your JavaScript file
function addGlobalStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// Add custom animations
addGlobalStyle(`
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out;
    }
`);
