const router 	=  require('express').Router();

// import utility
const dbQuery = require('../utility/mongooseQue');
const authUtil = require('../utility/authUtil');

module.exports = (io) => {
	


	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/auditlogs

	Description:
	Api for fetching audit logs of the user currently logged in

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', authUtil.verifyUserGetMethod, async (req, res) => {

		try {

			const userId = req.body.userId
			const auditLogs = await dbQuery.findAllPopulate(
				`AuditLog`,
				{ user : userId, isServer : false },
				{ path	: 'user' , select	: {password: 0}
			});


			if (auditLogs.value){
				return res.send(auditLogs.statusCode).send(auditLogs.message)
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
	router.get('/admin',authUtil.verifyAdminGetMethod, async (req, res) => {
		
		try {
			
			let auditLogs = await dbQuery.findAllPopulate(`AuditLog`,null,{
												path	: 'user' , 
												select	: {password: 0}
											});
			
			if (auditLogs.value){
				return res.send(auditLogs.statusCode).send(auditLogs.message)
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

			const {numb} = req.body;
			console.log(typeof numb, numb)
			
			
			res.send('asd')
		} catch (err) {
			console.log(err)
		}
	})

	return router;
}

