const { VerifyAdminRights, VerifySession, VerifyCredentials } = require('../../utility/middlewares');
const getAutomatedEmailTemplate = require('../../utility/handlers/ApplicationSettings/AutomatedEmail/GetTemplate');

const router = require('express').Router();

/* --------------------------------------------------------------------------------
Route:
/api/settings/

Query Parameters:
- email
- access_token

Description:
-	This API is used for retrieving the current state of emmy settings

Middlewares:
# ValidateSession
-	Ensures that the user requesting for the API has an existing valid session

# ValidateAdminRights
- Ensures that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
-------------------------------------------------------------------------------- */
router.get('/',
	[
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const emailTemplate = await getAutomatedEmailTemplate();

			res.statusCode = 200;
			return res.send({
				template: emailTemplate
			});

		} catch (error) {
			console.log(error);
			return res.sendStatus(500);
		}
	}
);

module.exports = router;