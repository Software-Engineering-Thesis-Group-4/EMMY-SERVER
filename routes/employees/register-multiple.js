
const router = require('express').Router();

// models

// utilities
const { RegisterMultipleRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { ValidateFields, VerifyCredentials, VerifyAdminRights, VerifySession } = require('../../utility/middlewares/');

function CustomValidator(req, res, next) {
	if (!req.files && !req.files.csv) {
		res.statusCode = 404;
		return res.send({
			errors: "File is empty."
		})
	}

	next();
}


/* --------------------------------------------------------------------------------------------------
Route:
/api/employees/import

Query Parameters:
- email
- access_token

Description:
- This api is used for registering multiple employees in CSV format.

Middlewares:
# VerifySession
	-	Ensure that the user requesting for the API has an existing valid session

# VerifyAdminRights
	- Ensure that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.post('/import',
	[
		...RegisterMultipleRules,
		ValidateFields,
		VerifyCredentials,
		CustomValidator,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);
			const file = req.files.csv;

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "",
			});
			
		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("[Register Error] Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("[Register Error] Invalid Access Token.".red)
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
);


module.exports = router;