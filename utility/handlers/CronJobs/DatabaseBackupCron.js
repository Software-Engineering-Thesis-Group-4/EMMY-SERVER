const CronJob = require('cron').CronJob;
const databaseBackupHandler = require('../DatabaseBackup/DatabaseBackupHandler');

function AutoBackupSchedule() {
	return new CronJob(
		process.env.DB_BACKUP_SCHEDULE,
		databaseBackupHandler,
		null,
		false,
		'Asia/Manila'
	);
}

module.exports = AutoBackupSchedule;