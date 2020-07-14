const router = require('express').Router();

// utilities
const { ValidateFields, VerifyAdminRights, VerifyCredentials, VerifySession } = require('../../utility/middlewares');
const { SendEmailRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { sendEmail } = require('../../utility/handlers/Email/ManualEmailHandler');
const createAuditLog = require('../../utility/handlers/AuditLogs/CreateAuditLog');

/* --------------------------------------------------------------------------------
Route:
/api/employees/email

Query Parameters:
- user
- access_token

Body:
- subject
- emails
- message_html

Description:
-	This API is used for sending emails to employees.

Middlewares:
# ValidateSession
-	Ensures that the user requesting for the API has an existing valid session

# ValidateAdminRights
- Ensures that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
-------------------------------------------------------------------------------- */
router.post('/email',
	[
		...SendEmailRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			const { emails, subject, message_html } = req.body;

			await sendEmail(emails, subject, message_html);

			await createAuditLog(
				req.query.user,
				'EMAIL',
				`${req.query.user} sent an email to an employee.`,
				false
			);

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully sent emails to employee/s",
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
)

module.exports = router;