const express = require('express')
const router  = express.Router();
const path    = require('path');

// import utility
const { encrypt, decrypt } = require('../utility/aes');
const { isValidCsv } = require('../utility/importEmp');
const { toCsv } = require('../utility/export');

// import models
const { Employee } = require('../db/models/Employee');

module.exports = (io) => {

   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /api/employees/

	Description:
	?

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', async (req, res) => {
		try {
			// get all employees
			let employees = await Employee.find({});
			return res.status(200).send(employees);

		} catch (error) {
			console.error(error);
			return res.status(500).send('Server error. A problem occured when retrieving employees');
		}
	});



   // REMOVE: TEMPORARILY DISABLE ENCRYPTION
   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/employees/enroll

	Description:
	?

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll', (req, res) => {
      let employee = req.body;
      
      const new_employee = new Employee({
         employeeId       : encrypt(employee.employee_id),
         firstName        : encrypt(employee.firstname),
         lastName         : encrypt(employee.lastname),
         email            : encrypt(employee.email),
         isMale           : employee.isMale,
         employmentStatus : employee.employment_status,
         department       : employee.department,
         jobTitle         : employee.job_title,
         fingerprintId    : encrypt(employee.fingerprint_id),
      });

      // REFACTOR: CONVERT THIS SECTION TO ASYNC SYNTAX
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
	POST /api/employees/csv/import

	Description:
	This route is used when the HR uploads a CSV file for adding multiple employees

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/csv/import', async (req, res) => {

      try{
         const pathPublic = path.join(__dirname,'/../public/');
         console.log(req.files);
         if(req.files){
            console.log(req.files);
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
                  isValidCsv(pathPublic + 'import.csv',res);
                  
                  // go to vue route after importing employees 
                  // send employees to res?
               })
            }
         } else {
            res.status(204).send('Not selected a file or file is empty! Please select a file');
         }
      } catch (error){
         res.status(500).send('error on server');
      }    
   });
	
	
	/*----------------------------------------------------------------------------------------------------------------------
	export report to csv file must be used in logs ---- used in employees for testing purposes 
	----------------------------------------------------------------------------------------------------------------------*/
   router.get('/csv/export', (req,res) => {
      // decrypts every field and saves it to new database
         Employee.find()
            .then(emp => {
                  emp = decrypt(emp);
                  toCsv(emp);
            })
            .catch(err => console.error(err));

   });


   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/employees/:id

	Description:
	This route is used for marking employees as "terminated"

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.delete('/:id', (req, res) => {
		try {
			let id = req.params.id;

			Employee.findByIdAndUpdate(
				id,
				{ $set: { terminated: true } },
				{ new: true }
			);

			res.status(200);

		} catch (error) {
			res.status(500).send('Server error. Unable to delete employee.');
		}
	});

	return router;
}