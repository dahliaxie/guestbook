const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  timestamp: Date
});

module.exports = mongoose.model('Message', messageSchema);
