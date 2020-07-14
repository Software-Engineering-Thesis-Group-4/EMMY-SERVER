const router = require('express').Router();

// models
const { EmployeeLog } = require('../../db/models/EmployeeLog');

// utilities
const { DeleteRules } = require('../../utility/validators/employee-logs');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { ValidateFields, VerifyCredentials, VerifySession, VerifyAdminRights } = require('../../utility/middlewares');
const createAuditLog = require('../../utility/handlers/AuditLogs/CreateAuditLog');

// middlewares
function CustomValidator(req, res, next) {
	const { id } = req.params;

	if (!id) {
		res.statusCode = 400;
		return res.send({
			errors: "Unauthorized Access. Incomplete Credentials."
		})
	}

	next();
}


/* --------------------------------------------------------------------------------------------------
Route:
/api/employeelogs/:id

Query Parameters:
- user
- access_token

Description:
- 	This api is used for physically deleting an employee log from the database (WARNING: This operation is
	is potentially destructive)

Middlewares:
# ValidateSession
	- Ensure that the user has an existing session and is still valid

# ValidateAdminRights
	- Ensure that the user performing the action has administrator previliges
	

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.patch('/:id/delete',
	[
		...DeleteRules,
		ValidateFields,
		VerifyCredentials,
		CustomValidator,
		VerifySession,
		VerifyAdminRights

	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			const employee_log = await EmployeeLog.findById(req.params.id);
			if (!employee_log) {
				res.statusCode = 404;
				return res.send({
					new_token: new_token,
					errors: "Log does not exist."
				});
			}

			employee_log.deleted = true;
			await employee_log.save();

			await createAuditLog(
				req.query.user,
				'DELETE',
				`${req.query.user} marked an employee log as deleted.`,
				false
			);

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully marked an employee log deleted.",
				employee_log
			});

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("[Delete Error] Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("[Delete Error] Invalid Access Token.".red)
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