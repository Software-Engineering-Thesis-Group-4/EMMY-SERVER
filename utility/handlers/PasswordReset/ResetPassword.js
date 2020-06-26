const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../../../db/models/User');
const { encrypt } = require('../Encryption');

/* ------------------------------------------------------------------------
Throws:
- UserNotFound
------------------------------------------------------------------------ */
async function generateSecurityCode(email) {

	// find an existing user
	const user = await User.findOne({ email });
	if (!user) {
		const error = new Error('User does not exist');
		error.name = "UserNotFound";
		throw error;
	}

	// sign a new reset token
	let reset_token = jwt.sign({ email: user.email }, process.env.JWT_KEY, {
		expiresIn: process.env.RESET_TOKEN_DURATION
	});

	// generate security code
	let security_code = reset_token.substring(reset_token.length - 7);

	// encrypt
	security_code = encrypt(security_code);
	reset_token = encrypt(reset_token);

	// send email
	const email_message =
		`Hello <strong>${user.firstname}</strong>, You are currently trying to reset your password in Emmy.
		The security code is: <h1>${security_code}</h1>.
		If this is not you please ignore this email or contact an administrator.`

	const transport = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	await transport.sendMail({
		from: 'Emmy',
		to: user.email,
		subject: 'Password Reset',
		html: email_message
	});

	return reset_token;
}

module.exports = generateSecurityCode;