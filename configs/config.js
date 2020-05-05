const path 		= require('path');
const dotenv 	= require('dotenv');
const fs = require('fs')

const prodPath = process.env.EMMY;

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
	case 'production ':

		// if production mode, it will use the path to the .env file specified in EMMY system variable
		if(fs.existsSync(prodPath)){
			dotenv.config({ path: process.env.EMMY })
		} else {
			fs.existsSync(__dirname + '/./EMMY_DEV.env') ?
			dotenv.config({ path: path.resolve(__dirname, './EMMY_DEV.env') }) :
			console.error('Cant find env file inside project directory!');
		}
		
		
		break;

	case 'development ':
		
		// if development mode, it will use the sample config file in the project (EMMY_DEV.env)
		dotenv.config({ path: path.resolve(__dirname, './EMMY_DEV.env') })
		break;
}


module.exports = { ...process.env };