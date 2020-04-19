const fs = require('fs');
const _ = require('lodash');
const childProc = require('child_process');


// Concatenate root directory path with our backup folder.
const backupDirPath = process.env.BACKUP_PATH;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const dbOptions = {
	user: false,                           // must have value for security, default to false for dev phase
	pass: false,                           // must have value for security, default to false for dev phase
	host: 'localhost',
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	autoBackupPath: process.env.BACKUP_PATH
};


// Auto backup function  --------->> Refactor: Change all necessary absolute paths to relative for deployment
exports.dbAutoBackUp = () => {

	const newBackupPath = backupDirPath + '\\EmmsBackupDb';
	// Command for mongodb dump process
	let cmd = `mongodump --host ${dbOptions.host} --port ${dbOptions.port}  --db ${dbOptions.database} --out ${newBackupPath}`

	// if backup exist delete it ---> REVIEW: is there no available function for overwriting instead?
	if (fs.existsSync(newBackupPath)) {
		childProc.exec('rd/s/q ' + newBackupPath, (err, stdout, stderr) => {
			if (err) {
				console.log(err)
			} else
				console.log('succesfully deleted old backup!')
		})
		childProc.execSync(cmd, {
			cwd: 'C:\\Program Files\\MongoDB\\Server\\4.2\\bin'
		})
	}
	//if back up doesnt exist
	else {
		childProc.execSync(cmd, {
			cwd: 'C:\\Program Files\\MongoDB\\Server\\4.2\\bin'
		})
		console.log('Succesfully created backup!')
	}
};
