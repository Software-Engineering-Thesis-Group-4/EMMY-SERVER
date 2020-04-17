const fs = require('fs')
const path = '/configs/dotenv.js'
require('dotenv').config().parsed;

fs.access(path, fs.F_OK, (err) => { //async
   if (err) {
     console.log('env file does not exist');
     console.log('Production Mode');
     process.env.NODE_ENV = 'production';
   }
   //file exists
 })

module.exports = {

   env: process.env.NODE_ENV,

   // DATABASE
   dbname: process.env.DB_NAME,
   dbport: process.env.DB_PORT,
   dbtest: process.env.TEST_DB,
   port: process.env.PORT,
   backup_path: process.env.BACKUP_PATH,

   // WebToken
   jwtkey: process.env.JWT_KEY,
   refreshkey: process.env.REFRESH_KEY,
   refreshtokenduration: process.env.REFRESH_TOKEN_DURATION,
   cookieduration: process.env.COOKIE_DURATION,

   // Encryption
   aeskey: process.env.AES_KEY,

   // Mailer
   email_user: process.env.EMAIL_USERNAME,
   email_pass: process.env.EMAIL_PASSWORD
};