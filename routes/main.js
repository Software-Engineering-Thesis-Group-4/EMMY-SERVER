const express = require('express');
const router = express.Router();

module.exports = (io) => {

   router.get('/', (req, res) => {
      res.redirect('/log_employee.html');
   });

   router.get('/logs', (req, res) => {
      res.redirect('/user_log.html');
   })

   router.get('/email-notif', (req, res) => {
      res.redirect('/email_notif.html');
   });
   
   router.get('/db-backup', (req,res) => {
      res.redirect('/dbBackup.html')
   })

   router.get('/register/user', (req, res) => {
      res.redirect('/enroll_user.html');
   });

   router.get('/register/employee', (req, res) => {
      res.redirect('/enroll_employee.html');
   });

   router.get('/login', (req, res) => {
      res.redirect('/test_login.html');
   })

   router.get('/reset-password', (req, res) => {
      res.redirect('/resetPass.html');
   })

   router.get('/reset-password-key', (req, res) => {
      res.redirect('/resetPassEmail.html');
   })

   router.get('/csv', (req, res) => {
      res.redirect('/mass_upload.html');
   })


   return router;
}