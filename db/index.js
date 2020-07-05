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
		// scheduled server task
		const connection = await mongoose.connect(`mongodb://localhost:${port}/${db_name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});

		if (!fs.existsSync(path.join(__dirname, './zip/'))) {
			fs.mkdirSync(path.join(__dirname, './zip/'));
		}

		if (!fs.existsSync(path.join(__dirname, './backups/'))) {
			fs.mkdirSync(path.join(__dirname, './backups/'));
		}

		await initializeAdmin();
		await initializeSettings();
		runCronJobs();

		console.clear();
		return connection;

	} catch (error) {
		console.clear();
		console.log('Failed to initialize connection from MongoDB'.bgRed);
		throw new Error(error);
	}
}

exports.closeDBConnection = async () => {
	try {
		console.log('closing connection...');
		await mongoose.connection.close();
		console.log('database connection closed.');
		console.log("-------------------------------------------------------------------");
	} catch (error) {
		throw new Error(error);
	}
}