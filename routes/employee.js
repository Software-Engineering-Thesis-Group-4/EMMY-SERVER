const express = require('express')
const router  = express.Router();
const path = require('path');

// import models
const { Employee } = require('../db/models/Employee');
const { EmployeeLog } = require('../db/models/EmployeeLog');

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
   -> POST /api/employees/
   
   Description: 
   Add/enroll a new employee
   -----------------------------------------------------------*/
   router.post('/enroll', (req, res) => {
      let employee      = req.body;
      let _isMale       = (req.body.gender === 'M' ? true : false);
      
      let payroll_group;

      switch (employee.payroll_group) {
         case 'full-time':            
            payroll_group = 1;
            break;
         
         case 'part-time':
            payroll_group = 0;
            break;
      
         default:
            break;
      }

      console.log(employee.department);

      const new_employee = new Employee({
         employeeId    : employee.employee_id,
         firstName     : employee.firstname,
         lastName      : employee.lastname,
         email         : employee.email,
         isMale        : _isMale,
         payrollGroup  : payroll_group,
         department    : employee.department,
         jobTitle      : employee.job_title,
         fingerprintId : employee.fingerprint_id,
      });

      
      new_employee.save((err, doc) => {
         if(err) {
            return res.send(500).send('Server error. Unable to register new employee.');
         }

         console.log('Successfully registered/enrolled a new employee!');
         return res.status(201).redirect('/enroll_employee.html');
      });
   });

   
   

   return router;
}