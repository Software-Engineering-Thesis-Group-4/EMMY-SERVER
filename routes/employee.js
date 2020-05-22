const express = require('express')
const router = express.Router();
const path = require('path');


// import utility
const { csvImport } = require('../utility/importEmp');
const aes = require('../utility/aes');
const exportDb = require('../utility/export');
const dbBackup = require('../utility/dbBackup');
const logger = require('../utility/logger');
const db = require('../utility/mongooseQue');


// TODO: IMPLEMENT DATABASE MODULE
module.exports = (io) => {


	// FIX: move this to another route file dedicated for database backup
	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /api/employees/db-backup

	Description:
	Makes backup of database using mongodump (bson format)

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/db-backup', async (req,res) => {
		
		try {
			
			// user credentials from request body
			const { userId, loggedInUsername } = req.body;

			const downloadPath = path.join(__dirname+'/../downloadables/backup.zip');
			const isErr = await dbBackup.zipBackup();

			if(isErr.value) {

				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,7,null,isErr.message);
				res.status(500).send('Error on downloading zip file');	
			} else {
				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,7);
				res.download(downloadPath);
			}
		} catch (err) {

			//---------------- log -------------------//
			logger.employeeRelatedLog(userId,loggedInUsername,7,null,err.message);
				
			console.log(err);
			res.status(500).send('Error on server');

		}

	})

	// FIX: move this to another route file dedicated for database backup
	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /api/employees/db-backup-restore

	Description:
	Restores backup of database using the files mongodump created

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/db-backup-restore', async (req, res) => {

		try {

			const { userId, loggedInUsername } = req.body;

			if (!req.files) {

				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,8,null,'Not selected a folder or folder is empty! Please select a new folder');
				return res.status(204).send('Not selected a folder or folder is empty! Please select a new folder!');

			} 

			const resFiles = req.files.bsonFiles;
				
			// clean uploads folder wether empty or not
			dbBackup.cleanUploads();


			const isErr = await dbBackup.dbRestore(resFiles);

			if(isErr.value){

				dbBackup.cleanUploads();
				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,8,null,isErr.message);
				return res.status(500).send(isErr.message);
						
			} else {
				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,8);
				console.log('Successfully restored database backup');
				return res.status(200).send('Successfully restored database backup');
						
			}
		} catch (err) {

			const { userId, loggedInUsername } = req.body;
			//---------------- log -------------------//
			logger.employeeRelatedLog(userId,loggedInUsername,8,null,err.message);
						
			console.log(err)
			return res.status(500).send('Error on server');
		}

	})

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
			let employees = await db.findAll('employee'); db.findAll

			if(employees.value){
				return res.status(500).send('Server error. A problem occured when retrieving employees');
			}

			return res.status(200).send(employees.output);

		} catch (error) {
			console.error(error);
			return res.status(500).send('Server error. A problem occured when retrieving employees');
		}
	});



   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/employees/enroll

	Description:
	?

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll', async (req, res) => {

		try {

			// user credentials from req body
			const { userId, loggedInUsername } = req.body;
			

			let {
				employee_id,
				firstname,
				lastname,
				email,
				isMale,
				employment_status,
				department,
				job_title,
				fingerprint_id
			} = req.body;

			employment_status = (employment_status === "Part-time" ? 0 : 1);

			const newEmployee = await db.save('employee',{
				employeeId: employee_id,
				firstName: firstname,
				lastName: lastname,
				email: email,
				isMale: isMale,
				employmentStatus: employment_status,
				department: department,
				jobTitle: job_title,
				fingerprintId: fingerprint_id,
			});
			

			if(newEmployee.value){
				return res.status(500).send(`500 Internal Server Error. ${newEmployee.message}`);
			}
			
			//---------------- log -------------------//
			logger.employeeRelatedLog(userId,loggedInUsername,3,`${firstname} ${lastname}`);
			return res.status(201).send("Successfully registered a new employee.")

		} catch (error) {

			const { userId, loggedInUsername } = req.body;
			//---------------- log -------------------//
			logger.employeeRelatedLog(userId,loggedInUsername,3,undefined,error.message);
			
			console.log(error.message);
			return res.status(500).send(`500 Internal Server Error. ${error.message}`);
		}
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

			// user credentials from req bod
			const { userId, loggedInUsername } = req.body;

			if(!req.files){
				return res.status(204).send('Not selected a file or file is empty! Please select a file');
			} 
			
			const csvFile = req.files.csvImport;
			const isErr = await csvImport(csvFile);

			if(isErr.value){
				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,0,null, isErr.message);
				return res.status(422).send({ message: isErr.message, duplicateValue: isErr.duplicateValue });
					
			} else {
				console.log('Successfully imported csv file!'.green)
				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,0);
				return res.status(200).send(isErr.message);
			}
						
			
		} catch (error) {

			const { userId, loggedInUsername } = req.body;

			//---------------- log -------------------//
			logger.employeeRelatedLog(userId,loggedInUsername,0,null, error.message);
			
			console.log(error)
			return res.status(500).send('Error on server');
		}    
   });
	
	
	/*----------------------------------------------------------------------------------------------------------------------
	TODO: export report must be used in logs ---- used in employees for testing purposes 
	----------------------------------------------------------------------------------------------------------------------*/
   router.get('/export-csv', async (req,res) => {

	try {
		
		const pathToDownload = path.join(__dirname, '/../downloadables/generated.csv')
		let emp = await db.findAll('employee');

		await exportDb.toCsv(emp);
		res.download(pathToDownload)
	} catch (error) {
		console.log(error.message);
		res.send('error')
	}

   });

  /*----------------------------------------------------------------------------------------------------------------------
	export report must be used in logs ---- used in employees for testing purposes 
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/export-pdf', async (req,res) => {

		try {

			exportDb.toPdf()
			res.send('hi')
		} catch (err) {
			console.log(err)
			res.send('error')
		}
		

	});

   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/employees/:id

	Description:
	This route is used for marking employees as "terminated"

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.delete('/:id', async (req, res) => {
		try {

			// user credentials from req body	
			const { userId, loggedInUsername } = req.body;

			let id = req.params.id;
			const emp = await db.updateById('employee',id, { terminated: true });
			

			if(emp.value){
				//---------------- log -------------------//
				logger.employeeRelatedLog(userId,loggedInUsername,4,`undefined`,'Error in deleting employee');
				return res.send(500).send('Error in deleting employee');
				
			} else {
				logger.employeeRelatedLog(userId,loggedInUsername,4,`${emp.output.firstName} ${emp.output.lastName}`);
				return res.status(200).send('Successfully deleted employee');
			}
			

		} catch (error) {

			const { userId, loggedInUsername } = req.body;
			//---------------- log -------------------//
			logger.employeeRelatedLog(userId,loggedInUsername,4,null, error.message);
			return res.status(500).send('Server error. Unable to delete employee.');
		}
	});

	return router;
}