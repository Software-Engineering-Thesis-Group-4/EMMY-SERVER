const http       = require('http');
const path       = require('path');
const logger     = require('morgan');
const socketIO   = require('socket.io');
const cors       = require('cors');
const express    = require('express');
const ip         = require('ip');
const helmet     = require('helmet');
const fileUpload = require('express-fileupload');
const colors     = require('colors');
const RateLimit  = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

const { createDBConnection } = require('./db');
colors.enable();

// LOAD ENVIRONMENT CONFIGURATIONS ----------------------------------------------------------------------------
const cfg = require('./configs/config.js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = cfg.PORT || 3000;

// APPLICATION CONFIGURATIONS ---------------------------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "client"))); // the directory for Vue
app.use(cors());
app.use(helmet());
app.use(fileUpload(/* (process.env.NODE_ENV === 'development ' ?
	{ debug: true } : { debug: false }) */
));

app.use(RateLimit({
	store: new MongoStore({
		uri: `mongodb://localhost:${cfg.DB_PORT}/${cfg.DB_NAME}`,
		collectionName: "expressRateLimitRecord"
	}),
	max: 100, //number of request threshold
	windowMs: 15 * 60 * 1000, //15mins per 100request threshold
	delayMs: 0
}));

app.use(helmet({
	xssFilter: {
		setOnOldIE: true,
		mode: null
	},
	noSniff: true,
	referrerPolicy: {
		policy: 'same-origin'
	},

	// TODO: Temporarily disabled Content Security Policy Rules
	// contentSecurityPolicy: {
	// 	directives: {
	// 		defaultSrc: ["'self'"],
	// 		styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
	// 		scriptSrc: ["'self'", "cdn.jsdelivr.net"],
	// 	}
	// },

	// for reducing surface area of potential attacks
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

	// click jacking protection
	frameguard: {
		action: 'sameorigin'
	}
}));


// IMPORT & CONFIGURE ROUTES ----------------------------------------------------------------------------------
const employeeLogsRoute = require('./routes/employee-logs')(io);
const employeeRoute = require('./routes/employee')(io);
const utilityRoute = require('./routes/main')(io);
const authRoute = require('./routes/auth')(io);
const userRoute = require('./routes/user')(io);
const auditLogsRoute = require('./routes/audit-logs')(io);


app.use('/auth', authRoute);									// localhost:3000/auth/
app.use('/main', utilityRoute); 								// localhost:3000/utility
app.use('/api/employees', employeeRoute); 				// localhost:3000/api/employees/
app.use('/api/employeelogs', employeeLogsRoute); 		// localhost:3000/api/employeelogs/
app.use('/api/users', userRoute);							// localhost:3000/api/employeelogs/
app.use('/api/auditlogs', auditLogsRoute);				// localhost:3000/api/auditlogs/


// SERVE VUE APPLICATION --------------------------------------------------------------------------------------
app.get(/.*/, (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});


// ERROR HANDLER ----------------------------------------------------------------------------------------------
// app.use((err, req, res) => {
// 	// set locals, only providing error in development
// 	res.locals.message = err.message;
// 	res.locals.error = req.app.get("env") === "development" ? err : {};

// 	res.status(err.status || 500);
// 	res.render("error");
// });


// BOOSTRAPPER ------------------------------------------------------------------------------------------------
async function start() {
	try {
		console.clear();
		console.log("Starting Application...".black.bgGreen + "\nInitializing connection to database...");

		// initialize database connection
		let { connection } = await createDBConnection(cfg.DB_NAME, cfg.DB_PORT);

		console.log(
			" SERVER RUNNING ".black.bgGreen + "\n" +
			"\nMongoDB Database: " + connection.name.brightCyan
		);

		const environment = (process.env.NODE_ENV === 'development ') ? 'Development'.black.bgYellow : 'Production'.black.bgCyan;
		const host_url = 'http://localhost:'.cyan + PORT.brightCyan;
		const net_url = `http://${ip.address()}:`.cyan + PORT.brightCyan;

		server.listen(PORT, () => {
			console.log(
				"--------------------------------------------------\n" +
				"- Environment: " + environment + "\n" +
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