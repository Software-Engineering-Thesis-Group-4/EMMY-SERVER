const express = require('express')
const router = express.Router();
const path = require('path');
const replaceString = require('replace-string');


// import utility
const { csvImport } = require('../utility/importEmp');
const aes = require('../utility/aes');
const exportDb = require('../utility/export');
const dbBackup = require('../utility/dbBackup');

// import models
const { Employee } = require('../db/models/Employee');

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
			
			const downloadPath = path.join(__dirname+'/../downloadables/backup.zip');
			const noErr = await dbBackup.zipBackup();

			noErr ?
				res.download(downloadPath) :
				res.status(500).send('Error on downloading zip file');

		} catch (err) {

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

			if (!req.files) {

				res.status(204).send('Not selected a file or folder is empty! Please select a file');

			} else {

				const resFiles = req.files.bsonFiles;
				const folderPath = path.join(__dirname, '/../uploads/');

				// clean uploads folder wether empty or not
				dbBackup.cleanUploads();

				let correctFormat = true;

				resFiles.forEach(async element => {

					if (element.name.substring(element.name.length, element.name.length - 4) != 'bson'
						&& element.name.substring(element.name.length, element.name.length - 4) != 'json') {

						console.log('Invalid file format');
						correctFormat = false;

					} else {

						if (element.name.substring(element.name.length, element.name.length - 4) === 'bson') {

							await element.mv(folderPath + element.name, err => {
								if (err) {
									console.log(err)
								}
							})
						}
					}
				});
				
				if(correctFormat == false) {

					dbBackup.cleanUploads();
					res.status(415).send('Incorrect file type for one or more files!')

				} else {

					const isTrue = await dbBackup.dbRestore();

					isTrue === true ?
						res.status(200).send('Successfully restored database backup') :
						res.status(500).send('Error on server');


				}
			}
		} catch (err) {
			console.log(err)
			res.status(500).send('Error on server');
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
			let employees = await Employee.find({});
			return res.status(200).send(employees);

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

			const newEmployee = new Employee({
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

			await newEmployee.save();

			return res.status(201).send("Successfully registered a new employee.")

		} catch (error) {
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
			if(!req.files){
				res.status(204).send('Not selected a file or file is empty! Please select a file');
			} else {
				const csvFile = req.files.csvImport;

				// check if file is csv
				if (csvFile.name.substring(csvFile.name.length, csvFile.name.length - 3) != 'csv') {
					res.status(415).send('must be csv file');

				} else { 
				
					const rawData = req.files.csvImport.data;
					
					// replace all \n and \r in csv file to coma
					const stringData 	= replaceString(rawData.toString(), ('\r\n'), ',');
					const isValid 		= await csvImport(stringData);

					isValid.isErr ? 
					res.status(422).send({ message: isValid.message, duplicateValue: isValid.duplicateValue }) :
					res.status(200).send(isValid.message);
				}		
			}
		} catch (error) {
			console.log(error)
			res.status(500).send('Error on server');
		}    
   });
	
	
	/*----------------------------------------------------------------------------------------------------------------------
	export report must be used in logs ---- used in employees for testing purposes 
	----------------------------------------------------------------------------------------------------------------------*/
   router.get('/export-csv', async (req,res) => {

	try {
		
		const pathToDownload = path.join(__dirname, '/../downloadables/generated.csv')
		let emp = await Employee.find();

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
			let id = req.params.id;

			await Employee.findByIdAndUpdate(
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