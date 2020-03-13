const nodemailer = require("nodemailer");


const gmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },tls:{
            rejectUnauthorized: false
        }
});

const sendMail = (sendToEmail, emailSubj, emailBody) => {
  gmail.sendMail({
    from    : 'Emmy',
    to      : sendToEmail, // list of receivers
    subject : emailSubj, // Subject line
    text    : emailBody // plain text body 
  });

  console.log('Succesfully sent mail');
}

const resetPassMail = (sendToEmail, username, key) => {
  const siteUrl = 'https//emmy/blah/blah';
  const devDets = '096969696969'
  const message = `Hello ${ username }, here is your verification key ${ key }.\n\n`
                + `You are currently trying to reset your password in ${siteUrl}.\n`
                + `If you are not trying to reset your password please ignore this email or `
                + `contact us and we will handle the rest. ${ devDets }`

  gmail.sendMail({
    from    : 'Emmy',
    to      : sendToEmail, // list of receivers
    subject : 'Reset password', // Subject line
    text    : message, // plain text body 
  });

  console.log('Succesfully sent mail');
}

module.exports = { 
  resetPassMail 
} 