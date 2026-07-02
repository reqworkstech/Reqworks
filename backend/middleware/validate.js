const { body, validationResult } = require('express-validator');

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must include at least one number'),
];

const loginRules = [
  body('email')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Standardize error message response
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg, // Return the first validation error message for simplicity
      errors: errors.array()
    });
  }
  next();
};

module.exports = { registerRules, loginRules, validate };
