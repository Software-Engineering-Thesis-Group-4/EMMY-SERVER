const express = require('express');
const router = express.Router();

// import Employee and EmployeeLog
const { EmployeeLog } = require('../db/models/EmployeeLog');

// import utilities
const { handleEmployeeLog } = require('../utility/EmployeeLogHandler.js');
const logger = require('../utility/logger');

module.exports = (io) => {
	/*----------------------------------------------------------------------------------------------------------------------
	-> GET /api/employeelogs
   
	Description:
	Get all employeelogs

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', async (req, res) => {
		
		try {
			let employeeLogs = await EmployeeLog.find({}).populate('employeeRef');
			return res.status(200).send(employeeLogs);

		} catch (error) {
			console.log(error)
			return res.status(500).send('Server error. could not retrieve employee logs.');
		}

	});


	/*----------------------------------------------------------------------------------------------------------------------
	-> POST /api/employeelogs
   
	Description: 
	Fingerprint scanner endpoint 

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/', async (req, res) => {
		try {
			const fingerprintNumber = req.body.enrollNumber;
			let { status, message } = await handleEmployeeLog(io, fingerprintNumber);
			return res.status(status).send(message);

		} catch (error) {
			return res.status(error.status).send(error.message);
		}
	})

	/*----------------------------------------------------------------------------------------------------------------------
	-> DELETE /api/employeelogs/:id
   
	Description: 
	endpoint for marking a specific employee log as "deleted". (DISCLAIMER) this api does not physically delete the
	employee log from the database.

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.delete('delete/:id', async (req, res) => {

		try {

			//user credentials
			const { userUsername,userId } = req.body;

			let id = req.params.id;

			const empLog = await EmployeeLog.findByIdAndUpdate(
				id,
				{ $set: { deleted: true } },
				{ new: true }
			);

			if(!empLog) {
				logger.employeelogsRelatedLog(userId,userUsername,0,undefined,'Log not found.');
				return res.status(404).send('Log not found.');
			}

			
			logger.employeelogsRelatedLog(userId,userUsername,0,empLog._id);
			res.status(200);

		} catch (error) {
			
			const { userUsername,userId } = req.body;
			logger.employeelogsRelatedLog(userId,userUsername,1,undefined,error.message);

			console.log(error.message);
			res.status(500).send('Server error. Unable to delete employee log.');
		}
	})


	/*----------------------------------------------------------------------------------------------------------------------
	-> POST /api/employeelogs/edit/id:
   
	Description: 
	Fingerprint scanner endpoint 

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/edit/:id', async (req, res) => {

		try {
			
			//user credentials
			const { userUsername,userId } = req.body;

			const logId = req.params.id;
			const { emotionIn,emotionOut } = req.body;

			const empLog = await EmployeeLog.findByIdAndUpdate(
				logId,
				{ $set: { emotionIn, emotionOut} },
				{ new: true }
			);

			if(!empLog) {
				logger.employeelogsRelatedLog(userId,userUsername,1,undefined,'Log not found');
				return res.status(404).send('Log not found.');
			}


			logger.employeelogsRelatedLog(userId,userUsername,1,empLog._id);
			res.status(200).send('Successfully edited employee log');

		} catch (error) {

			const { userUsername,userId } = req.body;
			logger.employeelogsRelatedLog(userId,userUsername,1,undefined,error.message);

			res.status(500).send(error.message);
		}
	});




	/*----------------------------------------------------------------------------------------------------------------------
	-> POST /api/employeelogs/sentiment
   
	Description: 
	endpoint for getting the employee emotion input and update the employee log

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.patch('/sentiment', async (req, res) => {

		try {
			const { emotion, employeeLog, status } = req.body;
			let log = await EmployeeLog.findById(employeeLog);

			if (!log) {
				throw new Error('Log not found!');
			} else {
				switch (status) {
					case "in":
						log.emotionIn = emotion;
						await log.save();
						return res.sendStatus(200);

					case "out":
						log.emotionOut = emotion;
						await log.save();
						return res.sendStatus(200);
				}
			}

		} catch (error) {
			res.status(500).send(error.message);
		}
	});

	return router;
}