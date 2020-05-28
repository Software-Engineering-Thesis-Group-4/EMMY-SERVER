const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment');
const fs = require('fs');

// import utilities
const { handleEmployeeLog } = require('../utility/EmployeeLogHandler.js');
const logger = require('../utility/logger');
const autoEmail = require('../utility/autoEmail');
const db = require('../utility/mongooseQue');
const { save_emotionNotif } = require('../utility/notificationHandler');
const { verifyAdmin, verifyUser_GET, verifyAdmin_GET } = require('../utility/authUtil');
const leaderBoard = require('../utility/leaderBoards');

const { scannerRules, validate } = require('../utility/validator');
const { save_employeeNotif } = require('../utility/notificationHandler');
const exportDb = require('../utility/export');

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
	router.post('/scanner', scannerRules, validate, async (req, res) => {
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
	router.delete('/:id', verifyAdmin_GET, async (req, res) => {

		try {

			// user credentials
			const { loggedInUsername, userId } = req.query;

			let id = req.params.id;

			const empLog = await db.updateById('employeelog', id, { deleted: true });

			if (empLog.value) {
				logger.employeelogsRelatedLog(userId, loggedInUsername, 0, undefined, empLog.message);
				return res.status(404).send('Error deleting log(mark as deleted)');
			}

			// TODO
			//save_employeeNotif("deleted", userId, id);
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

			// TODO
			//save_employeeNotif(action, admin_objectId, employee_objectId);
			logger.employeelogsRelatedLog(userId, loggedInUsername, 1, empLog.output._id);
			// notifHandler --> employeeNotif
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

			const { emotion, employeeLog, status } = req.body;
			let log = await db.findById('employeelog', employeeLog);
			console.log(typeof employeeLog)
			if (log.value) {
				throw new Error('Log not found!');
			} else {

				if (emotion === 1 || emotion === 2) { //angry and sad
					save_emotionNotif(emotion, log.output.employeeRef._id); // employeeID == employeeLog ng id
					io.sockets.emit('newEmotionNotification')
				}

				switch (status) {

					case "in":
						await db.updateById('employeelog',employeeLog,{ emotionIn : emotion });
						if(emotion === 1) leaderBoard.angryEmoIncrementer(log.output.employeeRef._id);
						logger.employeelogsRelatedLog(log.output.employeeRef._id,`${log.output.employeeRef.firstName} ${log.output.employeeRef.lastName}`,2,emotion);

						io.sockets.emit('employeeSentiment')
						return res.sendStatus(200);

					case "out":
            await db.updateById('employeelog',employeeLog,{ emotionOut : emotion });
						if(emotion === 1) autoEmail.putToEmailQueue(log.output.employeeRef._id);
						logger.employeelogsRelatedLog(log.output.employeeRef._id,`${log.output.employeeRef.firstName} ${log.output.employeeRef.lastName}`,2,emotion);

						io.sockets.emit('employeeSentiment')
						return res.sendStatus(200);
				}
			}

		} catch (error) {
			res.status(500).send(error.message);
		}
	});


	/*----------------------------------------------------------------------------------------------------------------------
	GET /api/employeelogs/export-csv

	Description:
	Api for exporting employee logs through csv


	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/export-csv', verifyAdmin_GET, async (req, res) => {

		try {

			const { userId, loggedInUsername, startDate, endDate } = req.params;


			const pathToDownload = path.join(__dirname, `/../downloadables/employee-logs.csv`)
			const empLogs = await db.findAll('employeelog');


			const startLogDate = new Date(startDate)
			const endLogDate = new Date(endDate)


			if (empLogs.value) {
				logger.employeeRelatedLog(userId, loggedInUsername, 1, null, empLogs.message)
			}

			let arrEmp = [];

			empLogs.output.forEach(element => {
				if(element.dateCreated >= startLogDate && element.dateCreated <= endLogDate){
					
					arrEmp.push({ employee 		: `${element.employeeRef.firstName} ${element.employeeRef.lastName}`,
									in  		: moment(element.in).format('LT'),
									out 		: moment(element.out).format('LT'),
									emotionIn 	: exportDb.emotionPicker(element.emotionIn),
									emotionOut 	: exportDb.emotionPicker(element.emotionOut),
									dateCreated : moment(element.dateCreated).format('ll')
								})
				}
			});

			const exportedCsv = await exportDb.toCsv(arrEmp);

			if (exportedCsv.value) {
				logger.employeeRelatedLog(userId, loggedInUsername, 1, null, exportedCsv.message)
				return res.status(500).send(exportedCsv.message);
			}

			logger.employeeRelatedLog(userId, loggedInUsername, 1);
			return res.download(pathToDownload);
		} catch (error) {
			const { userId, loggedInUsername } = req.params;
			console.log(error.message);
			logger.employeeRelatedLog(userId, loggedInUsername, 1, null, exportedCsv.message)
			return res.status(500).send(error.message);
		}

	});


	/*----------------------------------------------------------------------------------------------------------------------
	POST /api/employeelogs/export-pdf

	Description:
	Api for making pdf file from exported employee logs

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/export-pdf', verifyAdmin, async (req,res) => {

		try{

			const { userId, loggedInUsername, startDate, endDate } = req.body;
		
			const empLogs = await db.findAll('employeelog');

			const startLogDate = new Date(startDate)
			const endLogDate = new Date(endDate)

			let arrEmp = [];

			empLogs.output.forEach(element => {

				if(element.dateCreated >= startLogDate && element.dateCreated <= endLogDate){
					arrEmp.push({ employee 		: `${element.employeeRef.firstName} ${element.employeeRef.lastName}`,
								in  		: moment(element.in).format('LT'),
								out 		: moment(element.out).format('LT'),
								emotionIn 	: element.emotionIn,
								emotionOut 	: element.emotionOut,
								dateCreated : moment(element.dateCreated).format('ll')
					})
				}
			});

			const madePdf = exportDb.toPdf(arrEmp,moment(startLogDate).format('ll'),moment(endLogDate).format('ll'));
			
			if(madePdf.value){
				logger.employeeRelatedLog(userId,loggedInUsername,2,null,madePdf.message);
				return res.status(500).send('Error making pdf file');
			}

			
			return res.status(200).send('Done making Pdf file')
		} catch (err) {
			console.log(err)
			const { userId, loggedInUsername } = req.body;
			logger.employeeRelatedLog(userId,loggedInUsername,2,null,err.message);
			res.status(500).send('Error making pdf')
		} 
	})


	/*----------------------------------------------------------------------------------------------------------------------
	GET /api/employeelogs/export-pdf-download

	Description:
	Api for downloading employee logs through pdf


	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/export-pdf-download', verifyAdmin_GET, (req,res) => {

		try{

			const { userId, loggedInUsername } = req.params;

			const pathToDownload = path.join(__dirname,'../downloadables/employee-logs.pdf');

			if (!fs.existsSync(pathToDownload)){
				logger.employeeRelatedLog(userId,loggedInUsername,2,null,'No downloaded pdf file');
				return res.status(404).send('No downloaded pdf file');
			}

			logger.employeeRelatedLog(userId,loggedInUsername,2);
			return res.download(pathToDownload);
		} catch (err) {
			console.log(err)
			const { userId, loggedInUsername } = req.params;
			logger.employeeRelatedLog(userId,loggedInUsername,2,null,err.message);
			return res.status(500).send('Error downloading pdf')
		}
	})

	return router;
}