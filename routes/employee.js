const express = require('express')
const router  = express.Router();
const path    = require('path');

// import utility
const { encrypt, decrypt } = require('../utility/aes');
const { csvImport }        = require('../utility/importEmp');
const { toCsv }            = require('../utility/export');
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
	Route:
	POST /api/employees/upload
	Description:
	This route is used when the HR uploads a CSV file for adding multiple employees
	Assignee:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll/csv', async (req, res) => {

      try{
         const pathPublic = path.join(__dirname,'/../public/');
         if(req.files){
            const csvFile  = req.files.csvImport;
            // check if file is csv
            if(csvFile.name.substring(csvFile.name.length, csvFile.name.length-3) != 'csv'){
               res.status(422).send('must be csv file');
            } else {
               await csvFile.mv(pathPublic + 'import.csv', (err) => {
                  if(err){
                     console.error(err);
                     res.status(500).send('error on server'); 
                  }
                  csvImport(pathPublic + 'import.csv');
                  // go to vue route after importing employees 
                  // send employees to res?
                  res.send('success')
               })
            }
         } else {
            res.status(204).send('Not selected a file or file is empty! Please select a file');
         }
      } catch (error){
         res.status(500).send('error on server');
      }    
   });
   
   // export report to csv file must be used in logs ---- used in employees for testing purposes
   router.get('/export/csv', (req,res) => {
      // decrypts every field and saves it to new database
         Employee.find()
            .then(emp => {
                  emp = decrypt(emp);
                  toCsv(emp);
                  res.send('success')
            })
            .catch(err => console.error(err));

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