const mongoose = require('mongoose');

const ussdTransactionSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['airtime', 'data'],
    required: true 
  },
  plan: { 
    type: String, 
    required: function() { 
      return this.type === 'data'; 
    } 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  network: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 1800 // 30 minutes TTL
  }
}, { timestamps: true });

// Create index for faster lookups
ussdTransactionSchema.index({ sessionId: 1, status: 1 });

module.exports = mongoose.model('USSDTransaction', ussdTransactionSchema);
