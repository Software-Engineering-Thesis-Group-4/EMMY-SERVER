const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

const { Employee } = require('../../../db/models/Employee');
const { Settings } = require('../../../db/models/Settings');

async function getEmailTemplateBody() {
	const settings = await Settings.findOne({
		$and: [
			{ category: "EMAIL" },
			{ key: "Automated Email" },
		]
	});

	const { subject, messageBody } = settings.state.template;
	return { subject, messageBody };
}

async function sendEmail(employee, transporter, email) {
	if (employee && transporter) {
		// create email template
		const html_email = await ejs.renderFile(
			path.resolve(__dirname, './template.ejs'),
			{
				firstname: employee.firstname,
				messageBody: email.messageBody
			}
		);

		// send email
		transporter.sendMail({
			from: 'Emmy',
			to: employee.email,
			subject: email.subject,
			html: html_email
		});
	}
}

async function processAutomatedEmail() {
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

		const employees = await Employee.find({ sendAutoEmail: true });

		if (employees && employees.length <= 0) return;

		const email = await getEmailTemplateBody();

		employees.forEach(async (employee) => {
			await sendEmail(employee, transporter, email);
			console.log(`Email sent to ${employee.email}`);
			employee.sendAutoEmail = false;
			await employee.save();
		});

		transporter.close();

	} catch (error) {
		console.log(error.message);
	}
}

module.exports = processAutomatedEmail;