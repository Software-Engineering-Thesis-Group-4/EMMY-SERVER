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

exports.resetPassMail = (sendToEmail, username, key) => {

	const siteUrl = 'https//emmy/blah/blah';
	const devDets = '096969696969'
	const message = `Hello ${ username }, here is your verification key ${ key }.\n\n`
					+ `You are currently trying to reset your password in ${siteUrl}.\n\n`
					+ `If you are not trying to reset your password please ignore this email or `
					+ `you can contact us ${ devDets }`

	gmail.sendMail({
		from    : 'Emmy',
		to      : sendToEmail, // list of receivers
		subject : 'Reset password', // Subject line
		text    : message, // plain text body 
	}, (err,info) => {

		if(err) { console.log(err) } 
		else    { console.log("Succesfully sent mail") }
	})

}

exports.sendEmailNotif = (sendToEmail, sender,mailBody) => {

	const message = `Hello there! This is ${sender} from the HR department. ` + mailBody;

	gmail.sendMail({
		from    : 'Emmy',
		to      : sendToEmail, // list of receivers
		subject : 'HR notification Email', // Subject line
		text    : message, // plain text body 
	}, (err,info) => {

		if(err) { console.log(err) }
		else    { console.log("Succesfully sent mail") }
	})
	
} 


exports.verifyUserMail = (sendToEmail, username, token) => {

	let verifUrl = `${process.env.MODE === 'prod' ? 'https://emmy/somethin.com' : 
					`http://localhost:${process.env.PORT}/auth/enroll/verif-mail/${token}`}`;
	const devDets = '096969696969';
	const message = verifUrl;

	
	gmail.sendMail({
		from    : 'Emmy',
		to      : sendToEmail, // list of receivers
		subject : 'Reset password', // Subject line
		text    : message, // plain text body 
	}, (err,info) => {

		if(err) { console.log(err) } 
		else    { console.log("Succesfully sent mail") }
	})

}