const fs = require('fs');
const _ = require('lodash');
const childProc = require('child_process');
const path = require('path');


const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;


 
const dbOptions = {
	user: false,                           // must have value for security, default to false for dev phase
	pass: false,                           // must have value for security, default to false for dev phase
	host: 'localhost',                    
	port: process.env.DB_PORT,
	database: process.env.DB_NAME
};

// backup database
exports.dbAutoBackUp = () => {
	
	try {

		const dbPath = path.join(__dirname, '/../db/backup')
		const newBackupPath = dbPath + '\\EmmyBackupDb';
		
		// Command for mongodb dump process
		let cmd = `mongodump --host ${dbOptions.host} --port ${dbOptions.port}  --db ${dbOptions.database} --out ${newBackupPath}`
					
		childProc.execSync(cmd,{
			cwd: 'C:\\Program Files\\MongoDB\\Server\\4.2\\bin'
		})

		return true;

	} catch (err) {
		console.log(err);
		return false
	}

};

// Restore database
exports.dbRestore = async () => {
	
	try {
		const uploadPath = path.join(__dirname, '/../uploads');

		// Command for mongodb dump process
		let cmd = `mongorestore --host ${dbOptions.host} --port ${dbOptions.port} --db ${dbOptions.database} ${uploadPath}`

		childProc.exec(cmd,{
			cwd: 'C:\\Program Files\\MongoDB\\Server\\4.2\\bin'
		})

		return true

	} catch (err) {
		console.log(err)
		return false
	}
};

exports.cleanUploads = () => {

	const uploadPath = path.join(__dirname, '/../uploads')
	console.log('hi')
	if(fs.existsSync(uploadPath)){
		childProc.execSync('del /s /q ' + uploadPath);
		console.log('Succesfully cleaned uploads folder');
	}
}