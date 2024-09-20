const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/guestbook', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define message schema and model
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// API endpoint to post messages
app.post('/api/messages', [
  body('name').isString().trim().notEmpty(),
  body('message').isString().trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, message } = req.body;
    const newMessage = new Message({ name, message });
    await newMessage.save();
    io.emit('message', newMessage); // Emit new message to all connected clients
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false, error });
  }
});

// Handle WebSocket connections
let messagePositions = {};
const userCursors = {};
let userCount = 0;

io.on('connection', (socket) => {
    console.log('A user connected');
    userCount++;
    io.emit('userCountUpdate', userCount);
    socket.on('cursorPositionUpdate', (data) => {
        userCursors[socket.id] = data;
        // Broadcast the cursor position to all other clients
        socket.broadcast.emit('cursorPositionUpdate', { id: socket.id, ...data });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete userCursors[socket.id];
        userCount--;
        io.emit('userCountUpdate', userCount);
        // Notify other clients that the cursor has been removed
        socket.broadcast.emit('cursorPositionUpdate', { id: socket.id, x: -100, y: -100 });
    });
    // Load initial messages and their positions
    Message.find().sort({ timestamp: -1 }).limit(10).exec((err, messages) => {
        if (err) {
            console.error('Error fetching messages:', err);
        } else {
            socket.emit('initialMessages', messages);
            messages.forEach(msg => {
                // Send current positions to the new client
                socket.emit('messagePositionUpdate', {
                    id: msg._id,
                    ...messagePositions[msg._id]
                });
            });
        }
    });

    // Handle position updates from clients
    socket.on('messagePositionUpdate', (update) => {
        messagePositions[update.id] = { x: update.x, y: update.y };
        socket.broadcast.emit('messagePositionUpdate', update); // Broadcast to other clients
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
