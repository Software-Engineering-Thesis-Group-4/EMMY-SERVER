let automatedEmail = null;
let databaseBackup = null;
let negativeSentimentLeaderboard = null;

function runCronJobs() {
	automatedEmail = require('./AutomatedEmailCron')();
	databaseBackup = require('./DatabaseBackupCron')();
	negativeSentimentLeaderboard = require('./NegativeSentimentLeaderboardCron')();

	automatedEmail.start();
	databaseBackup.start();
	negativeSentimentLeaderboard.start();
}

function getCronStatus() {
	return {
		automatedEmail: automatedEmail.running,
		databaseBackup: databaseBackup.running,
		negativeSentimentLeaderboard: negativeSentimentLeaderboard.running,
	}
}

function getInstances() {
	return {
		automatedEmailCron: automatedEmail,
		databaseBackupCron: databaseBackup,
		leaderboardCron: negativeSentimentLeaderboard
	}
}

function printCronStatus() {
	console.log(
		"--------------------------------------------------\n" +
		"Automated Email: " + (automatedEmail.running ? "active".green : "inactive".red) + "\n" +
		"Automated Backup: " + (databaseBackup.running ? "active".green : "inactive".red) + "\n" +
		"Leaderboard Refresh: " + (negativeSentimentLeaderboard.running ? "active".green : "inactive".red) +
		"\n--------------------------------------------------"
	);
}

module.exports = {
	runCronJobs,
	getCronStatus,
	getInstances,
	printCronStatus
};