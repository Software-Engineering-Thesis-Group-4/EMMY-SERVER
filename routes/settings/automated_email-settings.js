const router = require('express').Router();
const { VerifyAdminRights, VerifyCredentials, VerifySession, ValidateFields } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { query, body } = require('express-validator');
const updateAutomatedEmailSettings = require('../../utility/handlers/AutomatedEmail/UpdateAutomatedEmailSettings');
const { printCronStatus } = require('../../utility/handlers/CronJobs/ScheduledTaskHandler');
const createAuditLog = require('../../utility/handlers/AuditLogs/CreateAuditLog');

const UpdateAutomatedEmailRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),

	body('enabled').trim().escape().exists().notEmpty(),
	body('subject').trim().escape().exists().notEmpty().isString(),
	body('message_body').trim().exists().notEmpty().isString(),
]

// ROUTE: /api/settings/automated_email
router.patch('/automated_email',
	[
		...UpdateAutomatedEmailRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);
			const { enabled, message_body, subject } = req.body;

			const new_settings = await updateAutomatedEmailSettings(enabled, message_body, subject);

			await createAuditLog(
				req.query.user,
				'UPDATE',
				`${req.query.user} updated the automated email settings.`,
				false
			);

			// printCronStatus();

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully updated automated email settings.",
				state: new_settings
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

				case "UninitializedApplicationConfig":
					console.log(error.message);
					res.statusCode = 500;
					return res.send({
						errors: error
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