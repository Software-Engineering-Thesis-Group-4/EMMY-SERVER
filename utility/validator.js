const { body, validationResult } = require('express-validator')

//Prevent Reflected XSS attack: request-based attack
exports.validateLogin = [
	body('email').trim().escape()
		.notEmpty()
		.isEmail(),

	body('password').escape()
		.notEmpty().isAlphanumeric()
]

// Prevent Stored/Database/Persistent XSS attack
exports.registerValidationRules = [
	body('email').trim().escape()
		.notEmpty()
		.withMessage('Email cannot be empty.')

		.isEmail()
		.withMessage('Invalid Email Format.'),

	body('firstname').trim().escape()
		.notEmpty()
		.withMessage('Firstname cannot be empty.')

		.isAlpha()
		.withMessage('Invalid Firstname.'),

	body('lastname').trim().escape()
		.notEmpty()
		.withMessage('Lastname cannot be empty.')

		.isAlpha()
		.withMessage('Invalid Lastname.'),

	body('username').trim().escape()
		.notEmpty()
		.withMessage('Username cannot be empty.')

		.isAlphanumeric()
		.withMessage('Username can only contain numbers or letters'),

	body('password').escape()
		.notEmpty()
		.withMessage('Password cannot be empty')

		.isAlphanumeric()
		.withMessage('Password must contain numbers or letters')

		.isLength({ min: 6 })
		.withMessage('Password must be a minimum of 6 characters'),

	body('confirmPassword').escape()
		.notEmpty()
		.withMessage('Confirm password cannot be empty'),

	body('isAdmin').trim()
		.notEmpty()
		.withMessage('Account role cannot be empty.')

		.isBoolean()
		.withMessage('Account role must be boolean.'),
]

// Prevent BOTH Reflected XSS and Stored/Persistent XSS attack
exports.resetPassValidationRules = [
	// validate input code from sent email. 'Code' possibly alphanumeric only
	body('email')
		.trim().notEmpty().withMessage('Email cannot be empty')
		.isEmail().withMessage('Invalid email input'),
]

exports.resetKeyValidationRules = [
	// validate input code from sent email. 'Code' possibly alphanumeric only
	body('key')
		.trim().notEmpty().withMessage('Key cannot be empty')
		.isEmail().withMessage('Invalid key data'),
]


exports.validate = (req, res, next) => {
	let errors = validationResult(req);

	if (!errors.isEmpty()) {
		return next();
	} else {
		let errMessages = errors.errors.map(err => err.msg);
		return res.status(422).json(errMessages);
	}

}