const { body, validationResult } = require('express-validator')

// error messages
const ERR_INVALID_CREDENTIALS = "Invalid email or password.";
const ERR_SERVER_ERROR = "Internal Server Error.";
const ERR_UNAUTHORIZED = "Unauthorized Access.";
const ERR_UNAUTHENTICATED = "Unauthenticated.";


//Prevent Reflected XSS attack: request-based attack
exports.loginRules = [
	body('email').trim().escape()
		.notEmpty().withMessage('Login Error: Email cannot be empty')
		.isEmail().withMessage('Login Error: Invalid Email Format'),

	body('password').escape()
		.notEmpty().withMessage('Login Error: password cannot be empty')
		.isAlphanumeric().withMessage('Login Error: Invalid Password Format'),
]

// Prevent Stored/Database/Persistent XSS attack
exports.registerRules = [
	body('email').trim().escape()
		.notEmpty().withMessage('Register Error: Email cannot be empty')
		.isEmail().withMessage('Register Error: Invalid Email Format'),

	body('firstname').trim().escape()
		.notEmpty().withMessage('Register Error: Firstname cannot be empty')
		.isAlpha().withMessage('Register Error: Invalid Firstname'),

	body('lastname').trim().escape()
		.notEmpty().withMessage('Register Error: Lastname cannot be empty')
		.isAlpha().withMessage('Register Error: Invalid Lastname'),

	body('username').trim().escape()
		.notEmpty().withMessage('Register Error: Username cannot be empty')
		.isAlphanumeric().withMessage('Register Error: Username can only contain numbers, letters or both'),

	body('password')
		.notEmpty().withMessage('Register Error: Password cannot be empty')
		.isAlphanumeric().withMessage('Register Error: Password must only contain numbers, letters or both')
		.isLength({ min: 6 }).withMessage('Register Error: Password must be a minimum of 6 characters'),

	body('confirmPassword')
		.notEmpty().withMessage('Register Error: Confirm password cannot be empty')
		.isAlphanumeric().withMessage('Register Error: Confirm password must only contain numbers, letters or both'),

	body('isAdmin').trim()
		.notEmpty().withMessage('Register Error: Account role cannot be empty.')
		.isBoolean().withMessage('Register Error: Account role must be boolean.'),
]

// Prevent BOTH Reflected XSS and Stored/Persistent XSS attack
exports.resetPassRules = [
	// validate input email to start process
	body('email').trim()
		.notEmpty().withMessage('ResetPass Error: Email cannot be empty')
		.isEmail().withMessage('ResetPass Error: Invalid Email format'),
]

exports.resetKeyRules = [
	// validate input code from sent email. 'Code' possibly alphanumeric only
	body('key').trim().escape()
		.notEmpty().withMessage('ResetKey Error: Key cannot be empty')
		.isAlphanumeric().withMessage('ResetKey Error: Numbers and Letters only'),
]

exports.logoutRules = [
	body('email')
		.trim().notEmpty().withMessage("Logout Error: Email is empty")
		.isEmail().withMessage('Logout Error: Invalid Credential Format'),
]

exports.verifyTokenRules = [
	body('access_token')
		.notEmpty().withMessage('Verify Error: Token Empty')
		.isJWT().withMessage('Verify Error: Not a valid token'),

	body('email')
		.trim().notEmpty().withMessage('Verify Error: Email cannot be empty')
		.isEmail().withMessage('Verify Error: Not a valid email')
]

exports.validate = (req, res, next) => {
	let errors = validationResult(req);

	if (errors.isEmpty()) {
		return next();
	} else {
		let errMessages = errors.errors.map(err => err.msg);
		console.error(errMessages);
		//return res.status(422).json(errMessages);
	}

}