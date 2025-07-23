const mongoose = require("mongoose");
const { Schema } = mongoose;

const appliedCouponSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'coupons',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
appliedCouponSchema.index({ user: 1, isActive: 1 });
appliedCouponSchema.index({ user: 1, coupon: 1 }, { unique: true });

// Method to deactivate all other active coupons for the user
appliedCouponSchema.statics.deactivateOtherCoupons = async function(userId, currentCouponId) {
  return this.updateMany(
    { 
      user: userId, 
      _id: { $ne: currentCouponId },
      isActive: true 
    },
    { $set: { isActive: false }}
  );
};

// Method to get active coupon for user
appliedCouponSchema.statics.getActiveCoupon = function(userId) {
  return this.findOne({ user: userId, isActive: true })
    .populate('coupon')
    .exec();
};

const AppliedCoupon = mongoose.model('appliedCoupons', appliedCouponSchema);

module.exports = AppliedCoupon;
