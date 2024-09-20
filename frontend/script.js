const socket = io();

// Handle initial messages
socket.on('initialMessages', (messages) => {
    messages.forEach((msg) => {
        displayMessage(msg);
    });
});

// Handle new messages
socket.on('message', (msg) => {
    displayMessage(msg);
});

// Handle message position updates
socket.on('messagePositionUpdate', (update) => {
    const messageElement = document.querySelector(`.message[data-id="${update.id}"]`);
    if (messageElement) {
        messageElement.style.left = `${update.x}px`;
        messageElement.style.top = `${update.y}px`;
    }
});

const userCountElement = document.getElementById('userCount');
socket.on('userCountUpdate', (count) => {
    userCountElement.textContent = `Users online: ${count}`;
});

// Emit cursor position to the server at regular intervals
function sendCursorPosition() {
    const cursorPosition = {
        x: mouseX,
        y: mouseY
    };
    socket.emit('cursorPositionUpdate', cursorPosition);
}

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    sendCursorPosition();
});

const cursors = {};

// Handle cursor position updates from other clients
socket.on('cursorPositionUpdate', (data) => {
    let cursor = cursors[data.id];
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'user-cursor';
        document.body.appendChild(cursor);
        cursors[data.id] = cursor;
    }
    cursor.style.left = `${data.x}px`;
    cursor.style.top = `${data.y}px`;
});

setInterval(sendCursorPosition, 100); // Send cursor position every 100ms

const messageDisplayDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function displayMessage(message) {
    if (!message || !message.name || !message.message || !message.timestamp) {
        console.error('Invalid message format:', message);
        return;
    }

    const li = document.createElement('li');
    li.className = 'message';
    li.draggable = true; // Make the message draggable
    li.dataset.id = message._id; // Unique ID for each message
    li.dataset.timestamp = message.timestamp; // Store timestamp

    const name = document.createElement('div');
    name.className = 'message-name';
    name.textContent = message.name || 'Unknown';

    const date = document.createElement('div');
    date.className = 'message-date';
    try {
        const timestamp = new Date(message.timestamp);
        if (isNaN(timestamp.getTime())) {
            throw new Error('Invalid date');
        }
        date.textContent = `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
        console.error('Date parsing error:', error);
        date.textContent = 'Invalid date';
    }

    const text = document.createElement('div');
    text.textContent = message.message;

    li.appendChild(name);
    li.appendChild(date);
    li.appendChild(text);

    // Set universal random position
    const [x, y] = getPositionForMessage(message._id);
    li.style.position = 'absolute';
    li.style.left = `${x}px`;
    li.style.top = `${y}px`;

    document.getElementById('messagesList').appendChild(li);

    // Set a timeout to remove the message after 24 hours
    setTimeout(() => {
        li.remove();
    }, messageDisplayDuration);

    // Attach drag events
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragend', dragEnd);
}

function getPositionForMessage(messageId) {
    // Return a consistent random position based on the message ID
    const seed = parseInt(messageId.slice(0, 8), 16); // Simple hash based on message ID
    const x = (seed % (window.innerWidth - 200)); // Adjust based on message width
    const y = (seed % (window.innerHeight - 100)); // Adjust based on message height
    return [x, y];
}

let offsetX = 0;
let offsetY = 0;
let draggedElement = null;

function dragStart(e) {
    draggedElement = e.target; // Keep track of the element being dragged
    const rect = draggedElement.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    draggedElement.style.opacity = '0.5'; // Optional: make the dragged element semi-transparent
    e.dataTransfer.setData('text/plain', ''); // Required for drag events
}

function drag(e) {
    if (draggedElement) {
        // Update position of the dragged element based on cursor position
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;

        // Emit the new position to the server
        socket.emit('messagePositionUpdate', {
            id: draggedElement.dataset.id,
            x: x,
            y: y
        });
    }
}

function dragEnd(e) {
    if (draggedElement) {
        draggedElement.style.opacity = '1'; // Reset the opacity
        draggedElement = null; // Clear the reference to the dragged element
    }
}

function dragOver(e) {
    e.preventDefault(); // Prevent default to allow dropping
}

function drop(e) {
    e.preventDefault();
    if (draggedElement) {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;

        // Optional: Save the new position in local storage or server
        localStorage.setItem(`message-${draggedElement.dataset.id}-position`, JSON.stringify({ x, y }));

        draggedElement.style.opacity = '1'; // Reset the opacity after dropping
        draggedElement = null; // Clear the reference to the dragged element
    }
}

// Apply these event listeners to your draggable elements
document.querySelectorAll('.message').forEach(item => {
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('drag', drag);
    item.addEventListener('dragend', dragEnd);
});

// Add event listeners for the document to handle drag over and drop
document.addEventListener('dragover', dragOver);
document.addEventListener('drop', drop);

// Ensure messages stay within window bounds on resize
function resizeMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach((message) => {
        // Adjust the position to stay within the window bounds
        const x = Math.min(parseInt(message.style.left, 10), window.innerWidth - message.offsetWidth);
        const y = Math.min(parseInt(message.style.top, 10), window.innerHeight - message.offsetHeight);
        message.style.left = `${x}px`;
        message.style.top = `${y}px`;
    });
}

window.addEventListener('resize', resizeMessages);

// Ensure the popup is hidden by default
document.addEventListener('DOMContentLoaded', () => {
    const messagesList = document.getElementById('messagesList');
    const messages = messagesList.querySelectorAll('.message');

    messages.forEach(messageElement => {
        const messageTimestamp = new Date(messageElement.dataset.timestamp).getTime();
        const currentTime = Date.now();

        if (currentTime - messageTimestamp > messageDisplayDuration) {
            messageElement.remove();
        } else {
            // Set a timeout to remove the message after 24 hours from now
            setTimeout(() => {
                messageElement.remove();
            }, messageDisplayDuration - (currentTime - messageTimestamp));
        }
    });
});

// Function to open the popup
document.getElementById('openPopupButton').addEventListener('click', () => {
    const messagePopup = document.getElementById('messagePopup');
    const openPopupButton = document.getElementById('openPopupButton');
    if (messagePopup && openPopupButton) {
        messagePopup.classList.remove('hidden'); // Show the popup
        openPopupButton.classList.add('hidden'); // Hide the open button
    } else {
        console.error('Popup or button element not found');
    }
});

// Function to close the popup
document.getElementById('closePopupButton').addEventListener('click', () => {
    const messagePopup = document.getElementById('messagePopup');
    const openPopupButton = document.getElementById('openPopupButton');
    if (messagePopup && openPopupButton) {
        messagePopup.classList.add('hidden'); // Hide the popup
        openPopupButton.classList.remove('hidden'); // Show the open button
    } else {
        console.error('Popup or button element not found');
    }
});

// Function to handle message submission
let isSubmitting = false;

document.getElementById('submitMessageButton').addEventListener('click', () => {
    if (isSubmitting) return; // Prevent multiple submissions

    const message = document.getElementById('messageInput').value.trim();
    const name = document.getElementById('nameInput').value.trim();

    if (message && name) {
        isSubmitting = true; // Set flag to indicate submission in progress

        fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, name })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showThankYouMessage();
                // Optionally, you might want to close the popup and clear input fields
                document.getElementById('messageInput').value = '';
                document.getElementById('nameInput').value = '';
                document.getElementById('messagePopup').classList.add('hidden');
                document.getElementById('openPopupButton').classList.remove('hidden');
            } else {
                console.error('Failed to post message');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to post message');
        })
        .finally(() => {
            isSubmitting = false; // Reset flag after submission is complete
        });
    } else {
        alert('Please provide both name and message.');
    }
});

function showThankYouMessage() {
    const thankYouMessage = document.getElementById('thankYouMessage');
    if (thankYouMessage) {
        thankYouMessage.classList.add('show');
        console.log('Thank you message shown'); // Debugging line

        // Hide the thank you message after 3 seconds
        setTimeout(() => {
            thankYouMessage.classList.remove('show');
            console.log('Thank you message hidden'); // Debugging line
        }, 3000);
    } else {
        console.error('Thank you message element not found');
    }
}
