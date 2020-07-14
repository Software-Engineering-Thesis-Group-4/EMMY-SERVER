const nodemailer = require('nodemailer');

async function sendEmail(emails, subject, message_html) {
	try {
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

		if (emails.length <= 0) return;

		emails.forEach(email => {
			transporter.sendMail({
				from: "Emmy",
				to: email,
				subject: subject,
				html: message_html
			});
		});

		transporter.close();

	} catch (error) {
		console.log(error.message);
	}
}

module.exports = {
	sendEmail
}