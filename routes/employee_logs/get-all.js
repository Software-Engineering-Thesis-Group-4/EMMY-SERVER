const router = require('express').Router();
const { validationResult } = require('express-validator');

// models
const { EmployeeLog } = require('../../db/models/EmployeeLog');

// utilities
const { GetAllRules } = require('../../utility/validators/employee-logs');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession } = require('../../utility/middlewares');

// middlewares
const ValidateFields = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.statusCode = 400;
		return res.send({
			errors: errors.mapped()
		});
	}

	const { user, access_token } = req.query;
	if (!user || !access_token) {
		res.statusCode = 401;
		return res.send({
			errors: "Unauthorized Access. Incomplete Credentials"
		});
	}

	next();
}


/* --------------------------------------------------------------------------------------------------
Route:
/api/employeelogs/

Query Parameters:
- email
- access_token

Description:
- This api is used for fetching employee logs of all employee

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
		VerifySession
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			const logs = await EmployeeLog.find({});

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully fetched all employee logs.",
				employee_logs: logs
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