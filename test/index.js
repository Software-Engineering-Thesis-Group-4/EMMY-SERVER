const { createDBConnection, closeDBConnection } = require("../db/index.js");
const { insertRandomEmployees } = require("./test-generate_employees");
const { insertEmployeeLogs } = require("./test-generate_logs");
const dotenv = require('dotenv');
const path = require('path');

let cfg = dotenv.config({ path: path.resolve(__dirname, '../configs/EMMY_DEV.env') }).parsed;

async function start(entries) {
	try {
		// Initailize DB Connection
		await createDBConnection(cfg.DB_NAME, cfg.DB_PORT);

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