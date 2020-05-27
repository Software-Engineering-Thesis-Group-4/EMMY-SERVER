const { body, validationResult } = require('express-validator')

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

// Register new Employee
exports.registerEmployeeRules = [
	body('employee_id').trim().escape()
		.notEmpty().withMessage('Register Error: Employee ID cannot be empty')
		.isNumeric({ no_symbols: true }).withMessage('Register Error: Employee ID numerical only'),

	body('firstname').trim().escape()
		.notEmpty().withMessage('Register Error: FirstName cannot be empty')
		.isAlpha().withMessage('Register Error: Employee FirstName Invalid Format'),

	body('lastname').trim().escape()
		.notEmpty().withMessage('Register Error: Employee LastName cannot be empty')
		.isAlpha().withMessage('Register Error: Employee LastName Invalid Format'),


	body('email').trim().escape()
		.notEmpty().withMessage('Register Error: Email Address cannot be empty')
		.isEmail().withMessage('Register Error: Invalid Email Format'),


	body('isMale').trim().escape()
		.notEmpty().withMessage('Register Error: Gender cannot be empty')
		.isBoolean().withMessage('Register Error: Invalid Gender Format'),

	body('employment_status').trim().escape()
		.notEmpty().withMessage('Register Error: Employment Status cannot be empty')
		.isNumeric().withMessage('Register Error: Employment Status numeric only'), //employmentStatus datatype?

	body('department').trim().escape()
		.notEmpty().withMessage('Register Error: Department cannot be empty')
		.isAlpha().withMessage("Register Error: Invalid 'Department' Format"),

	body('job_title').trim().escape()
		.notEmpty().withMessage('Register Error: Job Title cannot be empty')
		.isAlpha().withMessage('Register Error: Invalid Job Title Format'),

	body('fingerprint_id').trim().escape()
		.notEmpty().withMessage('Register Error: Fingerprint ID cannot be empty')
		.isNumeric({ no_symbols: true }).withMessage('Register Error: Invalid Fingerprint ID Format'), // no symbols: true == negative or float number not allowed
]

// Register New Standard/Admin Account
exports.registerUserRules = [
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

exports.scannerRules = [
	body('enrollNumber').trim()
	.notEmpty().withMessage('Scanner Error: Fingerprint Number cannot be empty')
	.isNumeric().withMessage('Scanner Error: Invalid Fingerprint Number')
]

// exports.validate = (req, res, next) => {
// 	let { errors } = validationResult(req);

// 	if (errors.length > 0) {
// 		console.log(errors);
// 	}
// 	if (errors)

// 	return next();
// }

exports.validate = (req, res, next) => {
	const errors = validationResult(req)

	if(!errors.isEmpty()){
		const extractedErrors = []
		errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

		return res.status(422).json({ errors: extractedErrors, });
	}

	return next();
 }