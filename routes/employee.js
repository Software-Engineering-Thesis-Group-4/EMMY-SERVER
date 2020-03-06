const express = require('express')
const router  = express.Router();
const path = require('path');

// import utility
const { encrypt, decrypt } = require('../utility/aes');

// import models
const { Employee } = require('../db/models/Employee');

// session checker middleware
const isAuthenticated = (req, res, next) => {
	if (req.session.role == 0) {
		console.log('authenticated!');
		return next();
	} else {
		return res.status(401).send(`you dont have admin privilages`);
	}
}

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
   router.post('/enroll', isAuthenticated, (req, res) => {
      let employee      = req.body;
      console.log(employee);

      const new_employee = new Employee({
         employeeId      : encrypt(employee.employee_id),
         firstName       : encrypt(employee.firstname),
         lastName        : encrypt(employee.lastname),
         email           : encrypt(employee.email),
         isMale          : employee.isMale,
         employmentStatus: employee.employment_status,
         department      : employee.department,
         jobTitle        : employee.job_title,
         fingerprintId   : encrypt(employee.fingerprint_id),
      });

      
      new_employee.save((err) => {
         if(err) {
            return res.sendStatus(500).send('Server error. Unable to register new employee.');
         }     
         
         Employee.find({}).then(employees => {
            decEmp = decrypt(employees);
            io.sockets.emit('newEmployee', decEmp);
            return res.sendStatus(201);
         }).catch(err => {
            console.log(err)
            return res.sendStatus(500).send('Server error. Unable to fetch employees');
         })
      })
   });


   /*----------------------------------------------------------------------------------------------------------------------
     -> DELETE /api/employees/:id
     
     Description: 
     mark an employee as "terminated"
     ----------------------------------------------------------------------------------------------------------------------*/
   router.delete('/:id', async (req, res) => {
      try {
         let id = req.params.id;
         let employee = await Employee.findByIdAndUpdate(
            id,
            { $set: { terminated: true } },
            { new: true }
         );
         // console.log(employee);
         res.status(200).send(employee);
      } catch (error) {
         res.status(500).send('Server error. Unable to delete employee.');
      }
   })

   
   

   return router;
}