const express = require('express');
const router = express.Router();

// import utilities
const { handleEmployeeLog } = require('../utility/EmployeeLogHandler.js');
const logger = require('../utility/logger');
const autoEmail = require('../utility/autoEmail');
const db = require('../utility/mongooseQue');
const { save_emotionNotif } = require('../utility/notificationHandler');
const { verifyAdmin, verifyUser_GET } = require('../utility/authUtil');

module.exports = (io) => {
	/*----------------------------------------------------------------------------------------------------------------------
	-> GET /api/employeelogs

	Description:
	Get all employeelogs

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', verifyUser_GET, async (req, res) => {

		try {

			let employeeLogs = await db.findAll('employeelog');
			return res.status(200).send(employeeLogs.output);

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
	router.delete('/:id', verifyAdmin, async (req, res) => {

		try {

			// user credentials
			const { loggedInUsername, userId } = req.body;

			let id = req.params.id;

			const empLog = await db.updateById('employeelog', id, { deleted: true });

			if (empLog.value) {
				logger.employeelogsRelatedLog(userId, loggedInUsername, 0, undefined, empLog.message);
				return res.status(404).send('Error deleting log(mark as deleted)');
			}


			logger.employeelogsRelatedLog(userId, loggedInUsername, 0, empLog.output._id);
			res.status(200);

		} catch (error) {

			const { loggedInUsername, userId } = req.body;
			logger.employeelogsRelatedLog(userId, loggedInUsername, 1, undefined, error.message);

			console.log(error.message);
			res.status(500).send('Server error. Unable to delete employee log.');
		}
	})


	/*----------------------------------------------------------------------------------------------------------------------
	-> PUT /api/employeelogs/id:
   
	Description: 
	edit employee logs 

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.put('/:id', verifyAdmin, async (req, res) => {

		try {

			//user credentials
			const { loggedInUsername, userId } = req.body;

			const logId = req.params.id;
			const { emotionIn, emotionOut } = req.body;

			const empLog = await db.updateById('employeelog', logId, { emotionIn, emotionOut });

			if (empLog.value) {
				logger.employeelogsRelatedLog(userId, loggedInUsername, 1, undefined, empLog.message);
				return res.status(404).send('Error on editing log.');
			}

			logger.employeelogsRelatedLog(userId, loggedInUsername, 1, empLog.output._id);
			res.status(200).send('Successfully edited employee log');

		} catch (error) {

			const { loggedInUsername, userId } = req.body;
			logger.employeelogsRelatedLog(userId, loggedInUsername, 1, undefined, error.message);

			res.status(500).send(error.message);
		}
	});




	/*----------------------------------------------------------------------------------------------------------------------
	-> PATCH /api/employeelogs/sentiment

	Description:
	endpoint for getting the employee emotion input and update the employee log

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	// FIX: Implement authenticated websocket connection.
	router.patch('/sentiment', async (req, res) => {

		try {
			console.log('Sentiment!')
			const { emotion, employeeLog, status } = req.body;
			let log = await db.findById('employeelog', employeeLog);

			if (log.value) {
				throw new Error('Log not found!');
			} else {

				if (emotion === '4' || emotion === '5') { //sad or angry
					save_emotionNotif(emotion, employeeLog); // employeeID == employeeLog
				}

				switch (status) {

					case "in":
						await db.updateById('employeelog',employeeLog,{ emotionIn : emotion });
						if(emotion === 1) autoEmail.angryEmoIncrementer(log.output.employeeRef._id);
						return res.sendStatus(200);

					case "out":
						await db.updateById('employeelog',employeeLog,{ emotionOut : emotion });
						if(emotion === 1) autoEmail.putToEmailQueue(log.output.employeeRef._id);
						return res.sendStatus(200);
				}
			}

		} catch (error) {
			res.status(500).send(error.message);
		}
	});



	/*----------------------------------------------------------------------------------------------------------------------
	-> GET /api/employeelogs/:_id

	Description:
	endpoint for getting the employee emotion input and update the employee log

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/:_id', verifyUser_GET, async (req, res) => {
		//objectID of employeeRef as Logs for Specific Employee ---> Employee Profile Page
		try {
			let id = req.params._id;
			const emplog = await db.findAll('employeelog', { employeeRef: id })

			if (emplog.value) {
				console.error(emplog.message);
				res.status(404).send("Logs not found");
			} else {
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