const { body, validationResult } = require('express-validator')

//Prevent Reflected XSS attack: request-based attack
const loginValidationRules = () => {
  return [
    body('email')
    .trim().not().isEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Invalid email format'),
    //FIX escape(does not work properly) unescape(),
    body('password')
    .not().isEmpty().withMessage('Password cannot be empty')
    .isAlphanumeric().withMessage('letters and numbers only')
  ]
}

// Prevent Stored/Database/Persistent XSS attack
const registerValidationRules = () => {
  return [
    body('email')
    .trim().not().isEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Invalid Email Format'),
    //FIX escape(does not work properly) unescape(),

    body('firstname')
    .trim().not().isEmpty().withMessage('Firstname cannot be empty')
    .isAlpha().withMessage('Invalid Firstname'),

    body('lastname')
    .trim().not().isEmpty().withMessage('Lastname cannot be empty')
    .isAlpha().withMessage('Invalid Lastname'),

    body('username')
    .trim().not().isEmpty().withMessage('username cannot be empty')
    .isAlphanumeric().withMessage('letters and numbers only'),

    body('password')
    .not().isEmpty().withMessage('Password cannot be empty')
    .isAlphanumeric().withMessage('letters and numbers only')
    .isLength({ min: 6 }).withMessage('Password must be a minimum of 6 characters'),

    body('confirmPassword')
    .not().isEmpty().withMessage('ConfirmPassword cannot be empty')
    .isAlphanumeric().withMessage('letters and numbers only')
    .isLength({ min: 6 }).withMessage('ConfirmPassword must be a minimum of 6 characters')
    .equals('password').withMessage('ConfirmPassword value must be equal to the initial Password value'),

    body('isAdmin')
    .trim().not().isEmpty().withMessage('Cannot be empty')
    .isBoolean().withMessage('Must be a boolean value')
  ]
}

// Prevent BOTH Reflected XSS and Stored/Persistent XSS attack
const resetPassValidationRules = () => {
  return [
    // validate input code from sent email. 'Code' possibly alphanumeric only
    body('email')
    .trim().not().isEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Invalid email input'),
  ]
}

const resetKeyValidationRules = () => {
   return [
     // validate input code from sent email. 'Code' possibly alphanumeric only
     body('key')
     .trim().not().isEmpty().withMessage('Key cannot be empty')
     .isEmail().withMessage('Invalid key data'),
   ]
 }

// TODO
//Still not sure how to implement verification
// const verifyValidationRules = () => {
//   return [

     // validate then sanitize
     // expected data to be received: password, 'code', email

//   ]
// }

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
  loginValidationRules,
  registerValidationRules,
  resetPassValidationRules,
  resetKeyValidationRules,
  validate,
}