const router = require('express').Router();

// models
const { Employee } = require('../../db/models/Employee');

// utilities
const { UpdateRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession, VerifyAdminRights, ValidateFields, VerifyCredentials } = require('../../utility/middlewares');

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

/* --------------------------------------------------------------------------------
Route:
/api/employees/:id

Query Parameters:
- email
- access_token

Body:
- employee_id
- firstname
- lastname
- email
- isMale
- employment_status
- department
- job_title
- fingerprint_id

Description:
-	This API is used for updating employee information (NOT including fields such as 
	photo, latest log, negativeEmotionCounter, etc.)

Middlewares:
# ValidateSession
-	Ensures that the user requesting for the API has an existing valid session

# ValidateAdminRights
- Ensures that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
-------------------------------------------------------------------------------- */
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
			let new_token = verifyAccessToken(req.query.access_token);

			const {
				employee_id,
				firstname,
				lastname,
				email,
				isMale,
				employment_status,
				department,
				job_title,
				fingerprint_id,
			} = req.body;

			const employee = await Employee.findById(req.params.id);

			if (!employee) {
				res.statusCode = 404;
				return res.send({
					errors: "Employee does not exist."
				});
			}

			employee.employeeId = employee_id;
			employee.firstname = firstname;
			employee.lastname = lastname;
			employee.email = email;
			employee.isMale = isMale;
			employee.employmentStatus = employment_status;
			employee.department = department;
			employee.jobTitle = job_title;
			employee.fingerprintId = fingerprint_id;

			const updatedEmployee = await employee.save();

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully updated an employee.",
				employee: updatedEmployee
			});

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
)

module.exports = router;