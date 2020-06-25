const router = require('express').Router();

// models
const { Employee } = require('../../db/models/Employee');

// utility
const { GetAllRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession, VerifyCredentials, ValidateFields } = require('../../utility/middlewares');


/* --------------------------------------------------------------------------------------------------
Route:
/api/employees/

Query Parameters:
- email
- access_token

Description:
- This api is used for fetching employee data

Middlewares:
# ValidateSession
	-	Ensure that the user requesting for the API has an existing valid session

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.get('/',
	[
		...GetAllRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession
	],
	async (req, res) => {
		try {
			let access_token = verifyAccessToken(req.query.access_token);

			const employees = await Employee.find({
				$where: function () {
					return !this.deleted
				}
			});

			res.statusCode = 200;
			return res.send({
				new_token: access_token,
				message: "Successfully fetched all employees.",
				employees: employees
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