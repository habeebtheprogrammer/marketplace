const { body, param, query } = require('express-validator');

// Validation for creating a coupon
exports.createCouponValidation = [
  body('code')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ min: 4, max: 20 }).withMessage('Coupon code must be between 4 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/).withMessage('Coupon code can only contain letters, numbers, underscores, and hyphens'),
    
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    
  body('discountType')
    .isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    
  body('discountValue')
    .isFloat({ gt: 0 }).withMessage('Discount value must be greater than 0'),
    
  body('maxDiscount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Maximum discount must be greater than 0'),
    
  body('minPurchase')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum purchase must be 0 or greater'),
    
  body('validFrom')
    .optional()
    .isISO8601().withMessage('Valid from must be a valid date')
    .toDate(),
    
  body('expiresAt')
    .notEmpty().withMessage('Expiration date is required')
    .isISO8601().withMessage('Expiration date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.validFrom && new Date(value) <= new Date(req.body.validFrom)) {
        throw new Error('Expiration date must be after valid from date');
      }
      return true;
    }),
    
  body('maxUses')
    .optional()
    .isInt({ min: 1 }).withMessage('Maximum uses must be at least 1'),
    
  body('validForPlans')
    .optional()
    .isArray().withMessage('Valid for plans must be an array')
    .custom(plans => {
      if (!Array.isArray(plans)) return true;
      
      for (const plan of plans) {
        if (!plan.planId || !plan.network || !plan.vendor) {
          throw new Error('Each plan must have planId, network, and vendor');
        }
      }
      return true;
    })
];

// Validation for validating a coupon
exports.validateCouponValidation = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('network').notEmpty().withMessage('Network is required'),
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('userId').notEmpty().withMessage('User ID is required')
];

// Validation for applying a coupon
exports.applyCouponValidation = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('network').notEmpty().withMessage('Network is required'),
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('userId').notEmpty().withMessage('User ID is required'),
  body('amount')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number')
];

// Validation for getting coupons
exports.getCouponsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
    
  query('status')
    .optional()
    .isIn(['active', 'expired']).withMessage('Status must be either active or expired')
];

// Validation for coupon ID in params
exports.couponIdValidation = [
  param('id')
    .notEmpty().withMessage('Coupon ID is required')
    .isMongoId().withMessage('Invalid coupon ID')
];
