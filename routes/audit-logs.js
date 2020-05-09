const router 	=  require('express').Router();

const dbQuery = require('../utility/dbAgnostics');

const { AuditLog} = require('../db/models/AuditLog')
const { ExtremeEmo} = require('../db/models/ExtremeEmo')
const { User } = require('../db/models/User');

const { Employee } = require('../db/models/Employee') 



const mailer = require('../utility/mailer')
const jwt = require('jsonwebtoken')
const token = require('../utility/jwt')

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
			const auditLogs = await dbQuery.findAllByFieldPopulate(
				`AuditLog`,
				{ user : userId },
				{ path	: 'user' , select	: {password: 0}
			});


			if (auditLogs.value){
				return res.send(500).send(auditLogs.message)
			}

			return res.status(200).send(auditLogs.output);

		} catch (error) {
			console.error(error);
			return res.status(500).send('Server error. A problem occured when retrieving the audit logs');
		}

	});
    

	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	GET /api/auditlogs

	Description:

	Api for fetching all the audit logs of the users and the app

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/admin', async (req, res) => {
		
		const emails = await Employee.find({ fingerprintId: { $gt: 17, $lt: 21 }, isMale : true },{ firstName : 1,email : 1})

		try {
			
			let auditLogs = await dbQuery.findAllPopulate(`AuditLog`,{
												path	: 'user' , 
												select	: {password: 0}
											});
			
			if (auditLogs.value){
				return res.send(500).send(auditLogs.message)
			}

			return res.status(200).send(auditLogs.output);

		} catch (error) {
			console.error(error);
			res.status(500).send('Server error. A problem occured when retrieving the audit logs');
		}

	});


////////////////////////////// FOR TESTING PURPOSES  ONLY ////////////////////////////////////
	router.post('/add-log', async (req,res) => {

		try{
		const {userID, log} = req.body;
		console.log({userID, log})
		const newLog = new AuditLog({
			description: log.trim(),
			user: userID,
			action: 'creae'
		})
		
		newLog.save();
		res.send("done")
		} catch (err) {
			console.log(err.message)
			const {userID, log} = req.body;	
			console.log({userID, log})
		}
	})


	/////////////////////////TODO:  will move this route not yet done ///////////////////////////////
	router.post('/edit/extreme-emotions-options', async (req,res) => {

		
		try{

			Date
			console.log(asdmonth)
			const { maxEmotionPoints, days, months} = req.body;
			extremeEmoOptions = {
				date : new Date(),
				maxEmotionPoints,
				day : extremeEmoOptions.days + days,
				month : extremeEmoOptions.months + months
			}
			
			
			res.send(extremeEmoOptions)
		} catch (err) {
			
		}
	})

	return router;
}

