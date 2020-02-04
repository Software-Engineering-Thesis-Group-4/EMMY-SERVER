const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USERNAME;
const emailPass = process.env.EMAIL_PASSWORD;


// async..await is not allowed in global scope, must use a wrapper
async function sendMail() {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls:{
        rejectUnauthorized: false
    }
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from    : 'emmstest1@gmail.com',
    to      : "mokiong1427@gmail.com", // list of receivers
    subject : "Hello ✔", // Subject line
    text    : "Hello world?", // plain text body
    html    : "<b>Hello world?</b>" // html body
  });

}


module.exports.sendMail = sendMail;