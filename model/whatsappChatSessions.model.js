const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  content: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    enum: ['text', 'markdown', 'html', 'template'],
    default: 'text',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const whatsappChatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  // Unique identifier from WhatsApp contacts payload (e.g., 2348...)
  waId: {
    type: String,
    index: true,
  },
  // Business phone number ID used to send messages
  phoneNumberId: {
    type: String,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'WhatsApp Chat',
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Dedupe fields
  lastInboundMessageId: {
    type: String,
    index: true,
  },
  lastConfirmHash: {
    type: String,
  },
  lastConfirmAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Plugins and indexes
whatsappChatSessionSchema.plugin(mongoosePaginate);
whatsappChatSessionSchema.index({ waId: 1, isActive: 1, updatedAt: -1 });
whatsappChatSessionSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });
whatsappChatSessionSchema.index({ sessionId: 1, isActive: 1 });
whatsappChatSessionSchema.index({ updatedAt: -1 });

const WhatsAppChatSession = mongoose.model('whatsapp_chat_sessions', whatsappChatSessionSchema);

module.exports = WhatsAppChatSession;
