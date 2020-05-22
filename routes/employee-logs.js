const express = require('express');
const router = express.Router();

// import Employee and EmployeeLog
const { EmployeeLog } = require('../db/models/EmployeeLog');

// import utilities
const { handleEmployeeLog } = require('../utility/EmployeeLogHandler.js');
const { save_emotionNotif } = require('../utility/notificationHandler');

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
	router.post('/scanner', async (req, res) => {
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
	// SUGGESTION: require a valid user session (access_token and email) before performing employee log deletion
	router.delete('/:id', async (req, res) => {
		try {
			let id = req.params.id;

			let log = await EmployeeLog.findById(id);

			if (!log) {
				return res.status(404).send('Log not found.');
			}

			log.deleted = true;
			log.save();

			res.status(200);
		} catch (error) {
			res.status(500).send('Server error. Unable to delete employee log.');
		}
	})


	/*----------------------------------------------------------------------------------------------------------------------
	-> POST /api/employeelogs/sentiment

	Description:
	endpoint for getting the employee emotion input and update the employee log

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	// FIX: Implement authenticated websocket connection.
	router.patch('/sentiment', async (req, res) => {

		try {
			const { emotion, employeeLog, status } = req.body;
			let log = await EmployeeLog.findById(employeeLog);

			if (!log) {
				throw new Error('Log not found!');
			} else {

				if(emotion === '4' || emotion === '5'){ //sad or angry
					save_emotionNotif(emotion, employeeLog); // employeeID == employeeLog
				}

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


	
	/*----------------------------------------------------------------------------------------------------------------------
	-> POST /api/employeelogs/:_id

	Description:
	get daily attendance logs of a specific employee

	Author:
	Paolo Latoja
	----------------------------------------------------------------------------------------------------------------------*/
	// SUGGESTION: require a valid user session (access_token and email) before proceeding to the retrieval of employee logs
	router.get('/:_id', async (req, res) => {
		//objectID of employeeRef as Logs for Specific Employee ---> Employee Profile Page
		try {
			let id = req.params._id;
			const emplog = await EmployeeLog.find({ employeeRef: id })

			if(!emplog){
				console.error("Logs Not Found");
				res.status(404).send("Logs not found");
			}else {
				console.log("Logs Found");
				res.status(200).send(emplog);
			}
		} catch (error) {
			console.log(error);
			console.log("Server Error".red);
			res.status(500).send("SERVER ERROR");
		}
	});

	return router;
}