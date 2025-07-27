const express = require('express');
const router = express.Router();
const couponController = require('../controller/coupons.controller');
const { body, query } = require('express-validator');
const { checkAuth, adminAccessOnly } = require('../utils/authMiddleware');

// @route   POST /api/coupons/validate
// @desc    Validate a coupon by code
// @access  Private
router.post(
  '/validate',
  checkAuth,
  [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Coupon code is required')
  ],
  couponController.validateCoupon
);

// @route   GET /api/coupons/active
// @desc    Get user's active coupon
// @access  Private
router.get('/active', checkAuth, couponController.getActiveCoupon);

// @route   GET /api/coupons/history
// @desc    Get user's coupon history
// @access  Private
router.get(
  '/history', 
  checkAuth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  couponController.getCouponHistory
);

// @route   POST /api/coupons/apply
// @desc    Apply a coupon to user's account
// @access  Private
router.post(
  '/apply',
  checkAuth,
  [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Coupon code is required')
  ],
  couponController.applyCoupon
);

// @route   DELETE /api/coupons/remove
// @desc    Remove active coupon
// @access  Private
router.delete('/remove', checkAuth, couponController.removeActiveCoupon);

// Admin routes
// @route   POST /api/coupons
// @desc    Create a new coupon (Admin only)
// @access  Private/Admin
router.post(
  '/',
  checkAuth,
  // adminAccessOnly,
  [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Coupon code is required')
      .isLength({ min: 4, max: 20 })
      .withMessage('Coupon code must be between 4 and 20 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('discountType')
      .isIn(['percentage', 'fixed'])
      .withMessage('Invalid discount type'),
    body('discountValue')
      .isFloat({ gt: 0 })
      .withMessage('Discount value must be greater than 0'),
    body('expiresAt')
      .notEmpty()
      .withMessage('Expiration date is required')
      .isISO8601()
      .withMessage('Invalid date format')
  ],
  couponController.createCoupon
);

// @route   GET /api/coupons
// @desc    Get all coupons (Admin only)
// @access  Private/Admin
router.get(
  '/',
  checkAuth,
  couponController.getAllCoupons
);

// @route   GET /api/coupons/:id
// @desc    Get coupon by ID (Admin only)
// @access  Private/Admin
router.get(
  '/:id',
  checkAuth,
  // adminAccessOnly,
  couponController.getCouponById
);

// @route   PUT /api/coupons/:id
// @desc    Update coupon (Admin only)
// @access  Private/Admin
router.put(
  '/:id',
  checkAuth,
  adminAccessOnly,
  couponController.updateCoupon
);

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon (Admin only)
// @access  Private/Admin
router.delete(
  '/:id',
  checkAuth,
  adminAccessOnly,
  couponController.deleteCoupon
);

module.exports = router;
