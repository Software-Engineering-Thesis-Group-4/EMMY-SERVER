const express = require('express');
const router = express.Router();
const Emailer   = require('../utility/mailer');

module.exports = (io) => {

   router.get('/', (req, res) => {
      res.redirect('/log_employee.html');
   });

   router.get('/enroll-admin', (req, res) => {
      res.redirect('/enroll_admin.html');
   });

   router.get('/enroll-employee', (req, res) => {
      res.redirect('/enroll_employee.html');
   })

   router.get('/process_resetpass', (req, res) => {

      // generate link for password reset
      // localhost:$PORT/changepass/$username/$token
      // redirect to confirmed password reset request

      Emailer.sendMail()
      .then(() => console.log("succesfully sent email"))
      .catch(err => console.err(err));

      res.sendStatus(200);

   })

   return router;
}