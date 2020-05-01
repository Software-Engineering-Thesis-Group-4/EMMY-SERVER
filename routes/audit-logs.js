const express = require('express');
const router = express.Router();

// import models
const { AuditLog } = require('../db/models/AuditLog');
const { User } = require('../db/models/User');


module.exports = (io) => {

	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/auditlogs

	Description:
	Api for fetching audit logs of the user currently logged in

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', async (req, res) => {

		try {

			const userId = req.body.userId
			const auditLogs = await AuditLog.find({ user: userId }).populate({
				path: 'user',
				select: { password: 0 }
			});


			return res.status(200).send(auditLogs);

		} catch (error) {
			console.error(error);
			return res.status(500).send('Server error. A problem occured when retrieving the audit logs');
		}

	});


	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/auditlogs

	Description:
	Api for fetching all the audit logs of the users and the app

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/admin', async (req, res) => {
		try {

			// get all employees
			const auditLogs = await AuditLog.find().populate({
				path: 'user',
				select: { password: 0 }
			});

			return res.status(200).send(auditLogs);

		} catch (error) {
			console.error(error);
			res.status(500).send('Server error. A problem occured when retrieving the audit logs');
		}
	});


	////////////////////////////// FOR TESTING PURPOSES ONLY ////////////////////////////////////
	router.post('/add-log', async (req, res) => {

		try {
			const { userID, log } = req.body;
			console.log({ userID, log })
			const newLog = new AuditLog({
				message: log.trim(),
				user: userID

			})

			newLog.save();
			res.send("done")
			res.send("done")
		} catch (err) {
			console.log(err.message)
			const { userID, log } = req.body;
			console.log({ userID, log })

		}
	})

	return router;
}

