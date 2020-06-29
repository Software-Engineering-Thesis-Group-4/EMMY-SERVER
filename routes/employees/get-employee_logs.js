const router = require('express').Router();

// models
const { Employee } = require('../../db/models/Employee');
const { EmployeeLog } = require('../../db/models/EmployeeLog');

// utilities
const { VerifySession, VerifyCredentials, VerifyAdminRights } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { GetLogsOfEmployeeRules } = require('../../utility/validators/employees')


/* --------------------------------------------------------------------------------------------------
Route:
/api/employees/:id/logs

Query Parameters:
- user
- access_token

Description:
- This api is used for fetching employee data

Middlewares:
# ValidateSession
	-	Ensure that the user requesting for the API has an existing valid session

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.get('/:_id/logs',
	[
		...GetLogsOfEmployeeRules,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			// verify token
			const new_token = verifyAccessToken(req.query.access_token);
			const employee_id = req.params._id;

			// find employee and check if existing
			const employee = await Employee.findById(employee_id);
			if (!employee) {
				res.statusCode = 404;
				return res.send({
					errors: "Employee does not exist."
				});
			}

			// fetch logs of employee
			const employee_logs = await EmployeeLog.find({
				$and: [
					{ employeeRef: employee._id },
					{ deleted: false }
				]
			});

			res.statusCode = 200;
			res.send({
				new_token,
				message: `Successufully fetched logs of employee (${employee.firstname} ${employee.lastname}).`,
				employee_logs
			});

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
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