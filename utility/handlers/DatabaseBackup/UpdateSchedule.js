const { Settings } = require('../../../db/models/Settings');
const initializeSettings = require('../../database/InitializeDefaultSettings');
const { getInstances } = require('../CronJobs/ScheduledTaskHandler');
const { CronTime } = require('cron');

async function updateSchedule(hour, minute) {
	await initializeSettings();

	const backupSettings = await Settings.findOne({
		$and: [
			{ category: "DATABASE" },
			{ key: "Backup" },
		]
	});

	const new_schedule = {
		hour: hour,
		minute: minute,
	};

	await backupSettings.updateOne({ state: { schedule: new_schedule } });

	const new_time = `0 ${minute} ${hour} * * *`;

	const { databaseBackupCron } = getInstances();

	databaseBackupCron.setTime(new CronTime(new_time));
	databaseBackupCron.start();

	return new_schedule;
}

module.exports = updateSchedule;