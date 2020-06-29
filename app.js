const http = require('http');
const path = require('path');
const morgan = require('morgan');
const socketIO = require('socket.io');
const cors = require('cors');
const express = require('express');
const ip = require('ip');
const helmet = require('helmet');

const rateLimiter = require('./utility/middlewares/RateLimiter');
const { SocketIoMain } = require('./utility/sockets');
require('colors');

const { createDBConnection } = require('./db');

// LOAD ENVIRONMENT CONFIGURATIONS ----------------------------------------------------------------------------
const cfg = require('./configs/startup_config');
const PORT = cfg.PORT || 3000;

// APPLICATION CONFIGURATIONS ---------------------------------------------------------------------------------
const app = express();
const server = http.createServer(app)
const io = socketIO(server);
SocketIoMain(io);
global.emmy_socketIo = io; // make socket io object accessible globally

// MIDDLEWARE CONFIGURATIONS ----------------------------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploaded-images")));
app.use(express.static(path.join(__dirname, "downloadables")));
app.use(express.static(path.join(__dirname, "client"))); // the directory for Vue
app.use(helmet({
	xssFilter: {
		setOnOldIE: true,
		mode: null
	},
	noSniff: true,
	referrerPolicy: {
		policy: 'same-origin'
	},
	featurePolicy: {
		features: {
			fullscreen: ["'*'"],
			vibrate: ["'none'"],
			payment: ["'none'"],
			camera: ["'none"],
			geolocation: ["'none'"],
			microphone: ["'none'"]
		}
	},
	frameguard: {
		action: 'sameorigin'
	}
}));

app.use(morgan('dev'));

// IMPORT & CONFIGURE ROUTES ----------------------------------------------------------------------------------
const employeeLogsRoute = require('./routes/employee_logs');
const employeeRoute = require('./routes/employees');
const utilityRoute = require('./routes/utility');
const authRoute = require('./routes/authentication');
const userRoute = require('./routes/users');
const settingsRoute = require('./routes/settings');

app.use('/api/auth', ...authRoute);
app.use('/api/employees', ...employeeRoute);
app.use('/api/employeelogs', ...employeeLogsRoute);
app.use('/api/users', ...userRoute);
app.use('/api/settings', ...settingsRoute);

// apply rate limit to api routes
app.use('/api/', rateLimiter);

// REFACTOR: -----------------------------------------------------------------------------------
const auditLogsRoute = require('./routes/audit-logs');
const adminRoute = require('./routes/admin');
app.use('/api/auditlogs', auditLogsRoute);
app.use('/api/admin', adminRoute);
// REFACTOR: -----------------------------------------------------------------------------------


// Restrict access to dev routes on production mode
if (process.env.NODE_ENV === 'development ') {
	app.use('/dev', utilityRoute);
}
else {
	app.get('/dev', (req, res) => {
		res.status(403).send('403 Forbidden Access');
	});
}

// SERVE VUE APPLICATION --------------------------------------------------------------------------------------
app.get("*", (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});


// BOOTSTRAP APPLICATION -------------------------------------------------------------------------------------
async function start() {
	try {
		console.clear();
		console.log("Starting Application...".black.bgGreen + "\nInitializing connection to database...");

		// initialize database connection
		let { connection } = await createDBConnection(cfg.DB_NAME, cfg.DB_PORT);

		console.log(
			" SERVER RUNNING ".black.bgGreen + "\n" +
			"\nDatabase: " + connection.name.brightCyan
		);

		const environment = (process.env.NODE_ENV === 'development ') ? 'DEVELOPMENT'.black.bgYellow : 'PRODUCTION'.black.bgCyan;
		const host_url = 'http://localhost:'.cyan + PORT.brightCyan;
		const net_url = `http://${ip.address()}:`.cyan + PORT.brightCyan;

		server.listen(PORT, () => {
			console.log(
				"--------------------------------------------------\n" +
				"- Mode: " + environment + "\n" +
				"- local: " + host_url + "\n" +
				"- network: " + net_url +
				"\n--------------------------------------------------"
			);
		});

	} catch (error) {
		console.log(
			"INTERNAL SERVER ERROR (500)".bgRed + "\n" +
			"Please restart the server..." + "\n"
		);
		console.error(error);
		throw new Error(error);
	}
}

start();