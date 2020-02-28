const express = require('express');
const router = express.Router();

module.exports = (io) => {

   // middleware function to check for logged-in users
   var sessionChecker = (req, res, next) => {
   	if (req.session.user && req.cookies.user_sid) {
   		 res.redirect('/dashboard');
   	} else {
   		 next();
   	}
   };

   router.get('/', sessionChecker, (req, res) => {
      res.redirect('/log_employee.html');
   });

   router.get('/enroll-admin', (req, res) => {
      res.redirect('/enroll_admin.html');
   });

   router.get('/enroll-employee', (req, res) => {
      res.redirect('/enroll_employee.html');
   })

   // router.get('') ----> /login, /logout

   return router;
}