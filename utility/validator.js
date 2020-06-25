const { body, query, validationResult } = require('express-validator')

//Prevent Reflected XSS attack: request-based attack
exports.loginRules = [
	body('email').trim().escape()
		.notEmpty().withMessage('Email cannot be empty')
		.isEmail().withMessage('Invalid Email Format'),

	body('password').escape()
		.notEmpty().withMessage('Password cannot be empty')
		.isAlphanumeric().withMessage('Invalid Password Format'),
]

// Prevent Stored/Database/Persistent XSS attack

// Register new Employee
exports.registerEmployeeRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),

	body('employee_id').trim().escape()
		.notEmpty().withMessage('Employee ID cannot be empty')
		.isNumeric({ no_symbols: true }).withMessage('Invalid Employee ID format'),

	body('firstname').trim().escape()
		.notEmpty().withMessage('FirstName cannot be empty')
		.isAlpha().withMessage('Employee FirstName Invalid Format'),

	body('lastname').trim().escape()
		.notEmpty().withMessage('Employee LastName cannot be empty')
		.isAlpha().withMessage('Employee LastName Invalid Format'),


	body('email').trim().escape()
		.notEmpty().withMessage('Email Address cannot be empty')
		.isEmail().withMessage('Invalid Email Format'),


	body('isMale').trim().escape()
		.notEmpty().withMessage('Gender cannot be empty')
		.isBoolean().withMessage('Invalid Gender Format'),

	body('employment_status').trim().escape()
		.notEmpty().withMessage('Employment Status cannot be empty')
		.isNumeric().withMessage('Invalid Employment Status'), //employmentStatus datatype?

	body('department').trim().escape()
		.notEmpty().withMessage('Department cannot be empty')
		.isString().withMessage('Invalid Department Format'),

	body('job_title').trim().escape()
		.notEmpty().withMessage('Job Title cannot be empty')
		.isString().withMessage('Invalid Job Title Format'),

	body('fingerprint_id').trim().escape()
		.notEmpty().withMessage('Fingerprint ID cannot be empty')
		.isNumeric({ no_symbols: true }).withMessage('Invalid Fingerprint ID Format'), // no symbols: true == negative or float number not allowed
]

// Register New Standard/Admin Account
exports.registerUserRules = [
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
		.isAlphanumeric().withMessage('Confirm password must only contain numbers, letters or both')
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Password confirmation does not match password');
			}

			return true;
		}),

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
		.isAlphanumeric().withMessage('Numbers and Letters only'),
]

exports.logoutRules = [
	query('user')
		.trim().notEmpty().withMessage("Email is empty")
		.isEmail().withMessage('Invalid Credential Format'),
]

exports.verifyTokenRules = [
	body('access_token')
		.notEmpty().withMessage('Token cannot be empty')
		.isJWT().withMessage('Invalid Token'),

	body('email')
		.trim().notEmpty().withMessage('Email cannot be empty')
		.isEmail().withMessage('Token email invalid format')
]

exports.scannerRules = [
	body('enrollNumber').trim()
		.notEmpty().withMessage('Fingerprint Number cannot be empty')
		.isNumeric().withMessage('Invalid Fingerprint Number')
]

exports.updateUserInfoRules = [
	body('firstname').trim()
		.notEmpty().withMessage('Firstname cannot be empty')
		.isAlpha().withMessage('Invalid Fingerprint Number'),

	body('lastname').trim()
		.notEmpty().withMessage('Lastname cannot be empty')
		.isAlpha().withMessage('Invalid Fingerprint Number'),

	body('username').trim()
		.notEmpty().withMessage('Username cannot be empty')
		.isAlpha().withMessage('Invalid Fingerprint Number'),

	body('email').trim()
		.notEmpty().withMessage('Email cannot be empty')
		.isEmail().withMessage('Invalid Email Format'),
]

exports.updatePasswordRules = [
	body('password').trim()
		.notEmpty().withMessage('Password cannot be empty')
		.isAlphanumeric().withMessage('Invalid Password Format'),

	body('confirmPassword').trim()
		.notEmpty().withMessage('Confirm Password cannot be empty')
		.isAlphanumeric().withMessage('Invalid Confirm Password Format'),
]

exports.resetPassFinalRules = [
	body('user').trim()
		.notEmpty().withMessage('User cannot be empty'),

	body('password').trim()
		.isAlphanumeric().withMessage('Invalid Password Format'),

	body('confirmPassword').trim()
		.notEmpty().withMessage('Confirm Password cannot be empty')
		.isAlphanumeric().withMessage('Invalid Confirm Password Format'),
]

exports.validate = (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(422).json(errors.mapped());
	}
	return next();
}