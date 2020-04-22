const path = require('path');
const dotenv = require('dotenv');

switch (process.env.NODE_ENV) {
	case 'production ':
		// if production mode, it will use the path to the .env file specified in EMMY system variable
		dotenv.config({ path: process.env.EMMY })
		break;

	case 'development ':
		// if development mode, it will use the sample config file in the project (EMMY_DEV.env)
		dotenv.config({ path: path.resolve(__dirname, './EMMY_DEV.env') })
		break;
}

module.exports = { ...process.env };