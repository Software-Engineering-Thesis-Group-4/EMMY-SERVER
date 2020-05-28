const router = require('express').Router();

// utilities
const appSettings = require('../utility/appSettings');
const logger = require('../utility/logger');
const { verifyAdmin, verifyAdmin_GET } = require('../utility/authUtil');

module.exports = (io) => {



	/*----------------------------------------------------------------------------------------------------------------------
  Route:
  POST /api/admin/change-autoemail-template
	
  Description:
	Route for changing email template
   
  Author:
  Michael Ong
  ----------------------------------------------------------------------------------------------------------------------*/
	router.post('/change-autoemail-template', verifyAdmin, async (req, res) => {

		try {

			// get user credentials from request body
			const { userId, loggedInUsername } = req.body;


			const { emailTemplate } = req.body

			const isErr = await appSettings.changeEmailTemplate(emailTemplate);

			if (isErr.value) {

				logger.userRelatedLog(userId, loggedInUsername, 7, `template`, isErr.message);
				return res.status(422).send('Error changing email template');

			} else {
				console.log('Successfully changed email template'.green)
				logger.userRelatedLog(userId, loggedInUsername, 7, `template`);
				return res.status(200).send('Successfully changed email template');
			}
		} catch (err) {

			const { userId, loggedInUsername } = req.body;

			console.log('Error changing email template'.red)
			logger.userRelatedLog(userId, loggedInUsername, 7, `template`, err.message);

			res.status(500).send('Error on server!');
		}
	});


	/*----------------------------------------------------------------------------------------------------------------------
  Route:
  POST /api/admin/change-autoemail-status
	
  Description:
	Route for changing auto email status
   
  Author:
  Michael Ong
  ----------------------------------------------------------------------------------------------------------------------*/
	router.post('/change-autoemail-status', verifyAdmin, async (req, res) => {

		try {

			// get user credentials from request body
			const { userId, loggedInUsername } = req.body;

			// autoEmailStatus must be boolean
			const { autoEmailStatus } = req.body

			const isErr = await appSettings.turnOnOffAutoEmail(autoEmailStatus);

			if (isErr.value) {

				logger.userRelatedLog(userId, loggedInUsername, 7, `active status`, isErr.message);
				return res.status(422).send('Error changing auto email status');

			} else {
				console.log('Successfully changed email template'.green)
				logger.userRelatedLog(userId, loggedInUsername, 7, `active status`);
				return res.status(200).send('Successfully changed auto email status');
			}
		} catch (err) {

			const { userId, loggedInUsername } = req.body;

			console.log('Error changing auto email status'.red)
			logger.userRelatedLog(userId, loggedInUsername, 7, `active status`, err.message);

			res.status(500).send('Error on server!');
		}
	});


	/*----------------------------------------------------------------------------------------------------------------------
  Route:
  GET /api/appsettings/
	
  Description:
	Route for getting all application settings
   
  Author:
  Michael Ong
  ----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', verifyAdmin_GET, async (req, res) => {
		
		try{
			return res.status(200).send({ emailTemplateTemplate : appSettings.emailTemplate, 
										autoEmailButton : appSettings.activateAutoEmailSystem });
		} catch (err) {
			console.log(err);
			return res.status(500).send('Error getting application settings');
		}
	});

	return router;
}

