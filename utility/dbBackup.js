const fs 		= require('fs');
const childProc = require('child_process');
const path 		= require('path');
const zipFold	= require('zip-a-folder');


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

		const dbPath = path.join(__dirname, '/../db/backup');

		// Command for mongodb dump process
		let cmd = `mongodump --host ${dbOptions.host} --port ${dbOptions.port}  --db ${dbOptions.database} --out ${dbPath}`
					
		childProc.execSync(cmd,{
			cwd: 'C:\\Program Files\\MongoDB\\Server\\4.2\\bin'
		})
		console.log('Succesfully created backup databases!');
		return isErr = { value : false };

	} catch (err) {
		console.log(err);
		return isErr = { value : true, message : err.message };
	}

};

exports.zipBackup = async () => {

	try {

		const zipPath 	= path.join(__dirname + '/../downloadables/backup.zip');
		const dbPath 	= path.join(__dirname, '/../db/backup/Emmy'); 

		const err = this.dbAutoBackUp();

		if(!err.value) {

			await zipFold.zip(dbPath, zipPath);
			console.log('Succesfully zipped backup folder');
			return isErr = { value: false };

		} else {
			console.log('Error on making database backup');
			return isErr = { value: true, message : err.message };
		}

	} catch (err) {
		console.log(err);
		return isErr = { value: true, message : err.message };
	}
}

// Restore database
exports.dbRestore = async (files) => {

	try {

		const uploadPath = path.join(__dirname, '/../db-uploads/');

		let correctFormat = true;

		files.forEach(async element => {

			if (element.name.substring(element.name.length, element.name.length - 4) != 'bson'
				&& element.name.substring(element.name.length, element.name.length - 4) != 'json') {

				console.log('Invalid file format');
				correctFormat = false;

			} else {

				if (element.name.substring(element.name.length, element.name.length - 4) === 'bson') {

					await element.mv(uploadPath + element.name, err => {
						if (err) {
							console.log(err)
							return isErr = { value: true, message: err.message }
						}
					})
				}
			}
		});

		if(correctFormat == false) {
			
			return isErr = { value: true, message: 'Incorrect file type for one or more files' }
		} else {

			// Command for mongodb dump process
			let cmd = `mongorestore --host ${dbOptions.host} --port ${dbOptions.port} --db ${dbOptions.database} ${uploadPath}`

			childProc.exec(cmd, {
				cwd: 'C:\\Program Files\\MongoDB\\Server\\4.2\\bin'
			})

			return isErr = { value : false };
		}	
	} catch (err) {
		console.log(err)
		return isErr = { value : true, message : err.message };
	}
};

exports.cleanUploads = () => {

	const uploadPath = path.join(__dirname, '/../uploads')
	
	if(fs.existsSync(uploadPath)){
		childProc.execSync('del /s /q ' + uploadPath);
		console.log('Succesfully cleaned uploads folder');
	}
}
