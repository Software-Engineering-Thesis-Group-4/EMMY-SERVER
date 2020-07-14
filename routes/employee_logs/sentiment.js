const router = require('express').Router();
const { query } = require('express-validator');

// models
const { EmployeeLog } = require('../../db/models/EmployeeLog');

// utilities
const { ValidateFields } = require('../../utility/middlewares')
const incrementNegativeEmotionCounter = require('../../utility/handlers/NegativeEmotionLeaderboard/NegativeSentimentHandler');
const createSentimentNotification = require('../../utility/handlers/Notifications/EmployeeLogNotifications');

const SubmitSentimentRules = [
	query('login_mode').trim().escape().exists().notEmpty(),
	query('sentiment').trim().escape().exists().notEmpty().isInt({
		min: 1,
		max: 5
	})
]

/* -----------------------------------------------------------------------------------
Route:
/api/employeelogs/sentiment/:id

Query Parameters:
- login_mode (true = "in", false = "out")
- sentiment (1-5)

Description:
-	This API endpoint is utilized by the tablet that is used for submitting employee
	sentiment.

Author/s:
- Nathaniel Saludes
------------------------------------------------------------------------------------- */
router.patch('/sentiment/:id',
	[
		...SubmitSentimentRules,
		ValidateFields,
	],
	async (req, res) => {
		try {
			const id = req.params.id;
			const employee_log = await EmployeeLog.findById(id);

			if (!employee_log) {
				res.statusCode = 404;
				return res.send({
					errors: "Employee log not found."
				});
			}

			const sentimentValue = parseInt(req.query.sentiment);
			if (req.query.login_mode === 'true') {
				employee_log.emotionIn = sentimentValue;
			} else {
				employee_log.emotionOut = sentimentValue;
			}

			// create audit log here...

			await employee_log.save();

			if(sentimentValue === 1) {
				await incrementNegativeEmotionCounter(employee_log.employeeRef);
			}

			if(sentimentValue === 1 || sentimentValue === 2) {
				await createSentimentNotification(sentimentValue, employee_log.employeeRef);
			}


			res.statusCode = 200;
			return res.send({
				message: "Successfully recorded sentiment.",
			});

		}
		catch (error) {
			console.log(`[${error.name}] ${error.message}`);
			res.statusCode = 500;
			return res.send({
				errors: error
			});
		}
	}
)

module.exports = router;