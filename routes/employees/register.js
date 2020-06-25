const router = require('express').Router();

// models
const { Employee } = require('../../db/models/Employee');

// utilities
const { RegisterOneRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession, VerifyAdminRights, ValidateFields, VerifyCredentials } = require('../../utility/middlewares');



/* --------------------------------------------------------------------------------------------------
Route:
/api/employees/register

Query Parameters:
- email
- access_token

Body:
- employee_id,
- firstname,
- lastname,
- email,
- isMale,
- department,
- job_title,
- fingerprint_id

Description:
- This API is used for enrolling a single employee to the system

Middlewares:
# ValidateSession
-	Ensure that the user requesting for the API has an existing valid session

# ValidateAdminRights
-	Ensure that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.post('/register',
	[
		...RegisterOneRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			let access_token = verifyAccessToken(req.query.access_token);

			const {
				employee_id,
				firstname,
				lastname,
				email,
				isMale,
				employment_status,
				department,
				job_title,
				fingerprint_id
			} = req.body;

			const employee = new Employee({
				employeeId: employee_id,
				firstname: firstname,
				lastname: lastname,
				email: email,
				isMale: isMale,
				employmentStatus: employment_status,
				department: department,
				jobTitle: job_title,
				fingerprintId: fingerprint_id
			});

			await employee.save();

			// TODO: Record/Log registering of new employee in system logs		

			// TODO: Create notification for newly created employee				

			// TODO: Emit socket event for the newly registered employee		

			res.statusCode = 200;
			return res.send({
				new_token: access_token,
				message: "Successfully registered a new employee.",
				employee: employee
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