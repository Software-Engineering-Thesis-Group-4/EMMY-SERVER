const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('colors');

// utilities
const initializeAdmin = require('../utility/database/InitializeAdmin');
const initializeSettings = require('../utility/database/InitializeDefaultSettings');
const { runCronJobs } = require('../utility/handlers/CronJobs/ScheduledTaskHandler');

exports.createDBConnection = async (db_name, port) => {
	try {

		// connect to the database
		const connection = await mongoose.connect(`mongodb://localhost:${port}/${db_name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});

		/* ----------------------------------------------------------------------------------------------
		the following directories are very crucial in the functioning of the application.
		Whenever the application is launched, it must ensure that the zip and backup directories
		are initialized.
		*/
		if (!fs.existsSync(path.join(__dirname, './zip/'))) {
			fs.mkdirSync(path.join(__dirname, './zip/'));
		}

		if (!fs.existsSync(path.join(__dirname, './backups/'))) {
			fs.mkdirSync(path.join(__dirname, './backups/'));
		}

		/* ----------------------------------------------------------------------------------------------
		It is important to ensure that the application must have at least one administrator which is 
		the root admin in order to be able to register other users.
		*/
		await initializeAdmin();
		await initializeSettings();

		/* ----------------------------------------------------------------------------------------------
		Run the scheduled tasks (i.e Scheduled Automated Email, Scheduled Database Backup, and the 
		Automatic Negative Sentiment Refresh)
		*/
		runCronJobs();

		console.clear();
		return connection;

	}
	catch (error) {
		console.clear();
		console.log('Failed to initialize connection from MongoDB'.bgRed);
		throw error;
	}
}

exports.closeDBConnection = async () => {
	console.log('closing connection...');
	await mongoose.connection.close();
	console.log('database connection closed.');
	console.log("-------------------------------------------------------------------")
}