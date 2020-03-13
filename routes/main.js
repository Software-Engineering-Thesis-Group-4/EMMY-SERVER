const express = require('express');
const router = express.Router();

module.exports = (io) => {

   router.get('/', (req, res) => {
      res.redirect('/log_employee.html');
   });

   router.get('/enroll-admin', (req, res) => {
      res.redirect('/enroll_admin.html');
   });

   router.get('/enroll-employee', (req, res) => {
      res.redirect('/enroll_employee.html');
   });

   router.get('/login-test', (req, res) => {
      res.redirect('/test_login.html');
   })

   router.get('/reset-password', (req, res) => {
      res.redirect('/resetPass.html');
   })

   router.get('/reset-password-key', (req, res) => {
      res.redirect('/resetPassEmail.html');
   })

   return router;
}