const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const journeyStepSchema = new Schema({
  day: { 
    type: Number, 
    required: [true, 'Day offset is required']
  },
  type: { 
    type: String, 
    enum: { 
      values: ['email', 'sms'], 
      message: '{VALUE} is not supported for step type' 
    },
    default: 'email'
  },
  template: { 
    type: String, 
    required: [true, 'Template name is required']
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const journeyTemplateSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Journey name is required'],
    enum: {
      values: ['signup', 'cart', 'post_purchase'],
      message: '{VALUE} is not a valid journey name'
    }
  },
  description: String,
  steps: [journeyStepSchema],
  active: { 
    type: Boolean, 
    default: true 
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users' 
  }
}, { timestamps: true });

journeyTemplateSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("JourneyTemplate", journeyTemplateSchema);
