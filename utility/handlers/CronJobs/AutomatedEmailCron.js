const { CronJob } = require('cron');
const automatedEmailHandler = require('../AutomatedEmail/AutomatedEmailHandler');

function AutomatedEmailSchdule() {
	return new CronJob(
		process.env.AUTO_EMAIL_SCHEDULE,
		automatedEmailHandler,
		null,
		false,
		'Asia/Manila'
	);
}

module.exports = AutomatedEmailSchdule;