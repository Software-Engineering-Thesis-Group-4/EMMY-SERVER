const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

function fileChecker(fpath){
	try {
		let checker = undefined;
		(fs.existsSync(fpath)) ? checker = true : checker = false;
		return checker;
	} catch(err) {
		console.error("FileChecker ERROR!\n " + err);
	}
}

// DONE
switch (process.env.NODE_ENV) {
	case 'production ': {
		// if production mode, it will use the path to the .env file specified in 'EMMY' system variable of the machine
		let filePath = process.env.EMMY;
		console.log("Production Path: " + filePath);

		if (fileChecker(filePath)) {
			dotenv.config({ path: filePath })
		} else {
			console.error("ENV File not found in specified path");
			process.exit();
		}
		break;
	}

	case 'development ': {
		// if development mode, it will use the sample config file in the project "configs/EMMY_DEV.env"
		let filePath = path.resolve(__dirname, './EMMY_DEV.env');

		if (fileChecker(filePath)) {
			dotenv.config({ path: filePath });
		} else {
			console.error("NO .ENV FILE IN DIRECTORY");
			process.exit();
		}
		break;
	}
}

module.exports = { ...process.env };