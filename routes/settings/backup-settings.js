const router = require('express').Router();
const { VerifyAdminRights, VerifyCredentials, VerifySession, ValidateFields } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { query, body } = require('express-validator');
const updateBackupSchedule = require('../../utility/handlers/DatabaseBackup/UpdateSchedule');
const { printCronStatus } = require('../../utility/handlers/CronJobs/ScheduledTaskHandler');


const UpdateBackupRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),

	body('hour').trim().escape().exists().notEmpty().isInt({ min: 0, max: 23 }),
	body('minute').trim().escape().exists().notEmpty().isInt({ min: 0, max: 59 }),
]

// ROUTE: /api/settings/backup/
router.patch('/backup',
	[
		...UpdateBackupRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);
			let { hour, minute } = req.body;

			hour = parseInt(hour);
			minute = parseInt(minute);

			const new_schedule = await updateBackupSchedule(hour, minute);

			printCronStatus();

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully updated database backup schedule.",
				schedule: new_schedule
			})
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