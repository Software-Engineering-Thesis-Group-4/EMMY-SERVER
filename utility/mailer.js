const nodemailer = require("nodemailer");


const gmail = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD
	},
		tls:{
				rejectUnauthorized: false
			}
	});

exports.resetPassMail =  async (sendToEmail, username, key) => {

	let isErr = {};

	try{

		const siteUrl = 'https//emmy/blah/blah';
		const devDets = '096969696969'
		const message = `Hello ${ username }, here is your verification key ${ key }.\n\n`
						+ `You are currently trying to reset your password in ${siteUrl}.\n\n`
						+ `If you are not trying to reset your password please ignore this email or `
						+ `you can contact us ${ devDets }`

		await gmail.sendMail({
			from    : 'Emmy',
			to      : sendToEmail, // list of receivers
			subject : 'Reset password', // Subject line
			text    : message, // plain text body 
		});

		return isErr = { value: false };
	} catch (err) {
		console.log(err);
		return isErr = { value: true, message: err.message };
	}
}

exports.sendEmailNotif = async (sendToEmail, sender,mailBody) => {

	let isErr = {};

	try{

		const message = `Hello there! This is ${sender} from the HR department. ` + mailBody;

		await gmail.sendMail({
			from    : 'Emmy',
			to      : sendToEmail, // list of receivers
			subject : 'HR notification Email', // Subject line
			text    : message, // plain text body 
		})


		return isErr = { value: false };
	} catch (err) {
		console.log(err);
		return isErr = { value: true, message: err.message };
	}
	
} 

exports.sendAutoEmail = async (sendToEmail) => {

	let isErr = {};

	try{

		const message = `Hello there! This email is from the HR department. blah blah blah`;

		await gmail.sendMail({
			from    : 'Emmy',
			to      : sendToEmail, // list of receivers
			subject : 'HR notification Email', // Subject line
			text    : message, // plain text body 
		
		})

		
		return isErr = { value: false };

	} catch (err) {
		console.log(err);
		return isErr = { value: true, message: err.message };
	}
	
} 