const zipAFolder = require('zip-a-folder');
const path = require('path');
const generateBackup = require('./DatabaseBackupHandler');

async function generateZipFile(source) {
	const outputDir = path.join(__basedir, `./db/zip/${process.env.DB_NAME}.zip`);

	await zipAFolder.zip(source, outputDir);
	console.log('Successfully generated a backup archive'.green);

	return `${process.env.DB_NAME}.zip`;
}

async function zipBackup() {
	try {
		await generateBackup();
		const sourceDirectory = path.resolve(__basedir, `./db/backups/${process.env.DB_NAME}`);

		const filename = await generateZipFile(sourceDirectory);
		return filename;

	} catch (error) {
		console.log(error.name);
		console.log(error.message);
	}
}

module.exports = zipBackup;