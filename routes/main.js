const express = require('express');
const router = express.Router();
const path = require('path');

// set path of the utility pages
const basePath = path.join(__dirname, '../utility/pages');

module.exports = (io) => {

   router.get('/', (req, res) => {
      res.sendFile(basePath + '/log_employee.html');
   });
   
   router.get('/enroll-admin', (req, res) => {
      console.log(basePath);
      res.sendFile(basePath + '/enroll_user.html');
   });

   router.get('/enroll-employee', (req, res) => {
      res.sendFile(basePath + '/enroll_employee.html');
   });

   router.get('/login', (req, res) => {
      res.sendFile(basePath + '/test_login.html');
   })

   router.get('/reset-password', (req, res) => {
      res.sendFile(basePath + '/resetPass.html');
   })

   router.get('/reset-password-key', (req, res) => {
      res.sendFile(basePath + '/resetPassEmail.html');
   })

   router.get('/csv', (req, res) => {
      res.sendFile(basePath + '/mass_upload.html');
   })


   return router;
}