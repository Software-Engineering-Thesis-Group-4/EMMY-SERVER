const { body, validationResult } = require('express-validator')

//Prevent Reflected XSS attack: request-based attack
exports.loginRules = [
	body('email').trim().escape()
		.notEmpty().withMessage('Email cannot be empty')
		.isEmail().withMessage('Invalid Email Format'),

	body('password').escape()
		.notEmpty().withMessage('password cannot be empty')
		.isAlphanumeric().withMessage('Invalid Password Format'),
]

// Prevent Stored/Database/Persistent XSS attack
exports.registerRules = [
	body('email').trim().escape()
		.notEmpty().withMessage('Email cannot be empty')
		.isEmail().withMessage('Invalid Email Format'),

	body('firstname').trim().escape()
		.notEmpty().withMessage('Firstname cannot be empty')
		.isAlpha().withMessage('Invalid Firstname'),

	body('lastname').trim().escape()
		.notEmpty().withMessage('Lastname cannot be empty')
		.isAlpha().withMessage('Invalid Lastname'),

	body('username').trim().escape()
		.notEmpty().withMessage('Username cannot be empty')
		.isAlphanumeric().withMessage('Username can only contain numbers, letters or both'),

	body('password')
		.notEmpty().withMessage('Password cannot be empty')
		.isAlphanumeric().withMessage('Password must only contain numbers, letters or both')
		.isLength({ min: 6 }).withMessage('Password must be a minimum of 6 characters'),

	body('confirmPassword')
		.notEmpty().withMessage('Confirm password cannot be empty')
		.isAlphanumeric().withMessage('Confirm password must only contain numbers, letters or both'),

	body('isAdmin').trim()
		.notEmpty().withMessage('Account role cannot be empty.')
		.isBoolean().withMessage('Account role must be boolean.'),
]

// Prevent BOTH Reflected XSS and Stored/Persistent XSS attack
exports.resetPassRules = [
	// validate input email to start process
	body('email').trim()
		.notEmpty().withMessage('Email cannot be empty')
		.isEmail().withMessage('Invalid Email format'),
]

exports.resetKeyRules = [
	// validate input code from sent email. 'Code' possibly alphanumeric only
	body('key').trim().escape()
		.notEmpty().withMessage('Key cannot be empty')
		.isAlphanumeric().withMessage('Invalid key data'),
]

exports.logoutRules = [
	body('email')
		.trim().notEmpty().withMessage("Error: Empty email")
		.isEmail().withMessage('Invalid Credential Format'),
]


exports.validate = (req, res, next) => {
	let errors = validationResult(req);

	if (errors.isEmpty()) {
		return next();
	} else {
		let errMessages = errors.errors.map(err => err.msg);
		return res.status(422).json(errMessages);
	}

}