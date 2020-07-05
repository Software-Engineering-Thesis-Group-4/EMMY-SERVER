const { VerifyAdminRights, VerifySession, VerifyCredentials } = require('../../utility/middlewares');
const initializeSettings = require('../../utility/database/InitializeDefaultSettings');
const { Settings } = require('../../db/models/Settings');
const { query } = require('express-validator');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');

const router = require('express').Router();

const GetAllSettings = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
]

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
		...GetAllSettings,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);
			await initializeSettings();

			const settings = await Settings.find({
				$or: [
					{ key: "Automated Email" },
					{ key: "Backup" },
					{ key: "Departments" },
				]
			}, { _id: 0, category: 0 });

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully retrieved settings status.",
				settings
			});

		} catch (error) {
			console.log(error);
			return res.sendStatus(500);
		}
	}
);

module.exports = router;