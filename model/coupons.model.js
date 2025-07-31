const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const couponPlanSchema = new Schema({
  planId: { type: String, required: true },
  network: { type: String, required: true },
  vendor: { type: String, required: true }
});

const couponSchema = new Schema(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true,
      trim: true
    },
    description: { 
      type: String,
      required: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    maxDiscount: {
      type: Number,
      min: 0
    },
    minPurchase: {
      type: Number,
      default: 0
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    maxUses: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    },
    validForPlans: [couponPlanSchema],
    usedBy: [{
      user: { type: Schema.Types.ObjectId, ref: 'users' },
      deviceId: { type: String },
      usedAt: { type: Date, default: Date.now }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ expiresAt: 1 });

// Method to check if coupon is valid for a user and device
couponSchema.methods.isValid = function(userId, deviceId) {
  const now = new Date();
  
  // Check basic validity
  if (!this.isActive) {
    return { isValid: false, message: 'This coupon is not active' };
  }
  
  if (this.maxUses && this.usedCount >= this.maxUses) {
    return { isValid: false, message: 'This coupon has reached its maximum usage limit' };
  }
  
  if (this.expiresAt < now) {
    return { isValid: false, message: 'This coupon has expired' };
  }

  // Check if user has already used this coupon
  if (this.usedBy.some(usage => usage.user.equals(userId))) {
    return { isValid: false, message: 'You have already used this coupon' };
  }

  // Check if device has already used this coupon
  if (deviceId && this.usedBy.some(usage => usage.deviceId === deviceId)) {
    return { isValid: false, message: 'This coupon has already been used on this device' };
  }

  return { isValid: true, message: 'Coupon is valid' };
};

// Method to mark coupon as used
couponSchema.methods.markAsUsed = async function(userId, deviceId) {
  this.usedCount += 1;
  this.usedBy.push({ 
    user: userId,
    deviceId: deviceId || null
  });
  
  // Deactivate if max uses reached
  if (this.maxUses && this.usedCount >= this.maxUses) {
    this.isActive = false;
  }
  
  return this.save();
};

couponSchema.plugin(mongoosePaginate);
const Coupon = mongoose.model('coupons', couponSchema);

module.exports = Coupon;
