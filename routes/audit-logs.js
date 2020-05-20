const router 	=  require('express').Router();

const dbQuery = require('../utility/mongooseQue');

const { AuditLog} = require('../db/models/AuditLog')
const { User } = require('../db/models/User');

const { Employee } = require('../db/models/Employee') 

const autoEm = require('../utility/autoEmail')

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

		const user = await User.find();
		
		user.forEach(element => {
			mailer.sendAutoEmail(element.email,element.firstname)
		});
		res.send('hi')
		// try {

		// 	const userId = req.body.userId
		// 	const auditLogs = await dbQuery.findAllByFieldPopulate(
		// 		`AuditLog`,
		// 		{ user : userId },
		// 		{ path	: 'user' , select	: {password: 0}
		// 	});


		// 	if (auditLogs.value){
		// 		return res.send(500).send(auditLogs.message)
		// 	}

		// 	return res.status(200).send(auditLogs.output);

		// } catch (error) {
		// 	console.error(error);
		// 	return res.status(500).send('Server error. A problem occured when retrieving the audit logs');
		// }

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
		
		const log = await dbQuery.findAll('auditlog');
		console.log(log)
		res.send(log.output)
		// try {
			
		// 	let auditLogs = await dbQuery.findAllPopulate(`AuditLog`,{
		// 										path	: 'user' , 
		// 										select	: {password: 0}
		// 									});
			
		// 	if (auditLogs.value){
		// 		return res.send(500).send(auditLogs.message)
		// 	}

		// 	return res.status(200).send(auditLogs.output);

		// } catch (error) {
		// 	console.error(error);
		// 	res.status(500).send('Server error. A problem occured when retrieving the audit logs');
		// }

	});


////////////////////////////// FOR TESTING PURPOSES  ONLY ////////////////////////////////////
	router.post('/add-log', async (req,res) => {

		try{

			const {numb} = req.body;
			console.log(typeof numb, numb)
			
			
			res.send('asd')
		} catch (err) {
			console.log(err)
		}
	})


	/////////////////////////TODO:  will move this route not yet done ///////////////////////////////
	router.post('/edit/extreme-emotions-options', async (req,res) => {

		
		try{

			const { inputDate } = req.body;
			console.log(inputDate)
			
			
			res.send('asd')
		} catch (err) {
			console.log(err)
		}
	})

	return router;
}

