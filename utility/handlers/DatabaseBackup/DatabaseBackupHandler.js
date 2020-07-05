const child_process = require('child_process');
require('colors').enable();

function DatabaseBackup() {
	try {
		let command = `mongodump --db ${process.env.DB_NAME} --out ./db/backups/`;

		return new Promise((resolve, reject) => {
			child_process
				.exec(command)
				.on('error', err => reject(err))
				.on('exit', () => {
					console.log('Successfully auto-generated a new database backup.'.green);
					resolve();
				});
		})

	} catch (error) {
		console.log(error);
		console.log('An error occured. unable to generate database backup.'.red);
	}
}

module.exports = DatabaseBackup;