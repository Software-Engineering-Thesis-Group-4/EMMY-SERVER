const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../../../db/models/User');
const { encrypt } = require('../Encryption');
const ejs = require('ejs');
const path = require('path');

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

	// render email template
	const html = await ejs.renderFile(path.resolve(__dirname, './email_template.ejs'), {
		user,
		security_code
	})

	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	await transporter.sendMail({
		from: 'Emmy',
		to: user.email,
		subject: 'Password Reset',
		html: html
	});

	return reset_token;
}

module.exports = generateSecurityCode;