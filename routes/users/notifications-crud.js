const router = require('express').Router();

// models
const { EmployeeDataNotification } = require('../../db/models/EmployeeDataNotif');

// utilities
const { VerifyCredentials, VerifySession, VerifyAdminRights } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');

/* ------------------------------------------------------------------------------------------
Route:
/api/users/notifications/crud

Query Parameters:
- user (email of current user)
- access_token

Description:
- this api is used for retrieving all crud notifications

Middlewares:
# ValidateSession
-	Ensures that the user requesting for the API has an existing valid session

# ValidateAdminRights
- Ensures that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
------------------------------------------------------------------------------------------ */
router.get('/notifications/crud',
	[
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			const notifications = await EmployeeDataNotification.find();

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Succesfully retrieved all crud notifications.",
				notifications
			});

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("Invalid Access Token.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Invalid Access Token."
					});

				default:
					console.log(`[${error.name}] ${error.message}`);
					res.statusCode = 500;
					return res.send({
						errors: error
					});
			}
		}
	}
)

module.exports = router;