const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: String,
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add pagination plugin
chatSessionSchema.plugin(mongoosePaginate);

// Index for faster querying
chatSessionSchema.index({ userId: 1, isActive: 1 });
chatSessionSchema.index({ sessionId: 1, isActive: 1 });
chatSessionSchema.index({ updatedAt: -1 });

const ChatSession = mongoose.model('chat_sessions', chatSessionSchema);

module.exports = ChatSession;
