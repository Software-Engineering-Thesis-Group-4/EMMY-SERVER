const router = require('express').Router();

// models
const { EmployeeLog } = require('../../db/models/EmployeeLog');

// utilities
const { UpdateRules } = require('../../utility/validators/employee-logs');
const { ValidateFields } = require('../../utility/middlewares/');
const { VerifyCredentials, VerifySession, VerifyAdminRights } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');

// middlewares
function CustomValidator(req, res, next) {
	const { id } = req.params;
	if (!id) {
		res.statusCode = 401;
		return res.send({
			errors: "Unauthorized Access. Incomplete Credentials"
		});
	}

	next();
}



/* -----------------------------------------------------------------------------------
Route:
/api/employeelogs/:id

Query Parameters:
- email
- access_token

Body:
- time_in
- time_out
- emotion_in
- emotion_out

Description:
-	This API is used for updating employee log information (NOT including fields such as 
	dateCreated, employee reference, deleted etc.)

Middlewares:
# ValidateSession
-	Ensures that the user requesting for the API has an existing valid session

# ValidateAdminRights
- Ensures that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
------------------------------------------------------------------------------------- */
router.put('/:id',
	[
		...UpdateRules,
		ValidateFields,
		VerifyCredentials,
		CustomValidator,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			const {
				time_in,
				time_out,
				emotion_in,
				emotion_out
			} = req.body;

			const employee_log = await EmployeeLog.findById(req.params.id);
			if (!employee_log) {
				res.statusCode = 404;
				return res.send({
					errors: "Update Failed. Employee log not found."
				});
			}

			employee_log.timeIn = time_in;
			employee_log.timeOut = time_out;
			employee_log.emotionIn = emotion_in;
			employee_log.emotionOut = emotion_out;

			const updated_log = await employee_log.save();

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successufully updated employee log.",
				employee_log: updated_log
			})

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("[Update Error] Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("[Update Error] Invalid Access Token.".red)
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