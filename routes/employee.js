const express = require('express')
const router  = express.Router();
const path = require('path');

// import models
const { Employee } = require('../db/models/Employee');

module.exports = (io) => {
   
   /*-----------------------------------------------------------
   -> GET /api/employees
   
   Description: 
   Get all employees
   -----------------------------------------------------------*/
   router.get('/', (req, res) => {
      Employee.find({}, (err, employees) => {
         if(err) {
            return res.status(500).send('Server error. A problem occured when retrieving employees');
         }

         return res.status(200).send(employees);
      });
   });

   /*-----------------------------------------------------------
   -> POST /api/employees/enroll
   
   Description: 
   Add/enroll a new employee
   -----------------------------------------------------------*/
   router.post('/enroll', (req, res) => {
      let employee      = req.body;
      console.log(employee);

      const new_employee = new Employee({
         employeeId      : employee.employee_id,
         firstName       : employee.firstname,
         lastName        : employee.lastname,
         email           : employee.email,
         isMale          : employee.isMale,
         employmentStatus: employee.employment_status,
         department      : employee.department,
         jobTitle        : employee.job_title,
         fingerprintId   : employee.fingerprint_id,
      });

      
      new_employee.save((err) => {
         if(err) {
            return res.sendStatus(500).send('Server error. Unable to register new employee.');
         }     
         
         Employee.find({}).then(employees => {
            io.sockets.emit('newEmployee', employees);
            return res.send(201);
         }).catch(err => {
            return res.send(500);
         })
      })
   });

   
   

   return router;
}