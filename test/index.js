const dotenv = require('dotenv');
const { createDBConnection, closeDBConnection } = require("../db/index.js");
const { insertRandomEmployees } = require("./test-generate_employees");
const { insertEmployeeLogs } = require("./test-generate_logs");

let cfg = dotenv.config().parsed;


async function start(entries) {

	try {
		// Initailize DB Connection
		await createDBConnection(cfg.TEST_DB, cfg.DB_PORT);
		
		// Perform Actions
		await insertRandomEmployees(entries);
		await insertEmployeeLogs();
		
		// Close DB Connection
		console.log(`--------------------------------------------------------------------`)
		await closeDBConnection();
	} catch (error) {
		console.log(error);
	}

}

start(200);