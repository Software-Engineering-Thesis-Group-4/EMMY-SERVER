const router = require('express').Router();

// models
const { Employee } = require('../../db/models/Employee');

// utilities
const { TerminateRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession, VerifyAdminRights, ValidateFields, VerifyCredentials } = require('../../utility/middlewares');
const createCrudNotification = require('../../utility/handlers/Notifications/UserSpecificNotifications');

// middlewares
function CustomValidator(req, res, next) {
	const { id } = req.params;

	if (!id) {
		res.statusCode = 401;
		return res.send({
			errors: "Unauthorized Access. Incomplete Credentials."
		})
	}

	next();
}

/* --------------------------------------------------------------------------------------------------
Route:
/api/employees/terminate/:id

Query Parameters:
- user
- access_token

Description:
- This api is used for marking an employee as "deleted" (NOTE: SOFT-DELETE ONLY)

Middlewares:
# ValidateSession
	- ensure that the user performing the operation has an existing valid session.

# ValidateAdminRights
	- ensure that the user performing the action has administrator previliges

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.patch('/terminate/:id',
	[
		...TerminateRules,
		ValidateFields,
		VerifyCredentials,
		CustomValidator,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {

			// [1] verify access token validity
			const new_token = verifyAccessToken(req.query.access_token);


			// [2] retrieve employee data from database
			const employee = await Employee.findById(req.params.id);


			// [3] check if employee exists, if not, return an error response for "Not Found"
			if (!employee) {
				res.statusCode = 404;
				return res.send({
					new_token: new_token,
					errors: "Employee does not exist.",
				})
			}

			if (employee.deleted) {
				res.statusCode = 200;
				return res.send({
					new_token: new_token,
					errors: "Employee is already terminated.",
					employee: employee
				})
			}


			// [4] else, set delete field to true and update document
			employee.deleted = true;
			await employee.save();

			await createCrudNotification('terminated', req.query.user, employee._id);


			// [5] return success response
			res.statusCode = 200;
			return res.send({
				new_token: new_token,
				message: `Successfully marked an employee deleted.`,
				employee: employee
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
);

module.exports = router;