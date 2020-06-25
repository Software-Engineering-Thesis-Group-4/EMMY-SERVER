const router = require('express').Router();

// models
const { Employee } = require('../../db/models/Employee');

// utility
const { DeleteRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession, VerifyAdminRights, ValidateFields, VerifyCredentials } = require('../../utility/middlewares');

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
/api/employees/:id

Query Parameters:
- user
- access_token

Description:
- 	This api is used for physically deleting employee from the database (WARNING: This operation is
	is potentially dangerous)

Middlewares:
# ValidateSession
	- Ensure that the user has an existing session and is still valid

# ValidateAdminRights
	- Ensure that the user performing the action has administrator previliges
	

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.delete('/:id',
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
			// [1] verify access token validity
			const new_token = verifyAccessToken(req.query.access_token);

			// [2] find employee using id
			const employee = await Employee.findById(req.params.id);

			// [3] check if employee exists. if not, return an error response for "Resource Not Found".
			if (!employee) {
				res.statusCode = 404;
				return res.send({
					new_token: new_token,
					errors: "Employee does not exist."
				});
			}

			// [4] delete employee record from the database
			await employee.remove();

			// [5] return success response
			res.statusCode = 200;
			return res.send({
				new_token: new_token,
				message: "Successfully deleted an employee.",
				employee: employee
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