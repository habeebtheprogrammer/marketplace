const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const userJourneyStepSchema = new Schema({
  day: { 
    type: Number, 
    required: [true, 'Day offset is required']
  },
  template: { 
    type: String, 
    required: [true, 'Template name is required']
  },
  type: { 
    type: String, 
    enum: { 
      values: ['email', 'push'], 
      message: '{VALUE} is not supported for step type' 
    },
    default: 'email'
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'sent', 'skipped', 'failed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending' 
  },
  scheduledAt: { 
    type: Date, 
    required: [true, 'Scheduled time is required']
  },
  sentAt: Date,
  error: String
}, { timestamps: true });

const userJourneySchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'users',
    required: [true, 'User ID is required']
  },
  templateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'JourneyTemplate',
    required: [true, 'Template ID is required']
  },
  journeyName: {
    type: String,
    required: [true, 'Journey name is required']
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: Date,
  active: { 
    type: Boolean, 
    default: true 
  },
  currentStep: { 
    type: Number, 
    default: 0 
  },
  steps: [userJourneyStepSchema],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Indexes for better query performance
userJourneySchema.index({ userId: 1, active: 1 });
userJourneySchema.index({ 'steps.status': 1, 'steps.scheduledAt': 1 });
userJourneySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("UserJourney", userJourneySchema);
