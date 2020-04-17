// const createError = require('http-errors');
const http       = require("http");
const path       = require("path");
const logger     = require("morgan");
const socketIO   = require("socket.io");
const cors       = require("cors");
const express    = require("express");
const ip         = require("ip");
const dotenv     = require("dotenv");
const helmet     = require("helmet");
const fileUpload = require("express-fileupload");
const colors     = require("colors");

// LOAD ENVIRONMENT VARIABLES ---------------------------------------------------------------------------------
const cfg = dotenv.config().parsed;

const app    = express();
const server = http.createServer(app);
const io     = socketIO(server);
const PORT   = cfg.PORT || 3000;

const mode 	= cfg.MODE;
colors.enable();

const { createDBConnection } = require("./db");

// APPLICATION CONFIGURATIONS ---------------------------------------------------------------------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "client"))); // the directory for Vue
app.use(cors());
app.use(helmet());
app.use(fileUpload((mode === 'dev' ? 
	{ debug: true } : { debug: false })
));

// IMPORT & CONFIGURE ROUTES ----------------------------------------------------------------------------------
const employeeLogsRoute = require('./routes/employee-logs')(io);
const employeeRoute = require('./routes/employee')(io);
const utilityRoute = require('./routes/main')(io);
const authRoute = require('./routes/auth')(io);
const userRoute = require('./routes/user')(io);

app.use('/auth', authRoute);									// localhost:3000/auth/
app.use('/main', utilityRoute); 							// localhost:3000/utility
app.use('/api/employees', employeeRoute); 				// localhost:3000/api/employees/
app.use('/api/employeelogs', employeeLogsRoute); 		// localhost:3000/api/employeelogs/
app.use('/api/users', userRoute)						// localhost:3000/api/employeelogs/

app.use("/auth", authRoute); 								// localhost:3000/auth/
app.use("/main", utilityRoute); 							// localhost:3000/utility
app.use("/api/employees", employeeRoute); 			// localhost:3000/api/employees/
app.use("/api/employeelogs", employeeLogsRoute); 	// localhost:3000/api/employeelogs/
app.get(/.*/, (req, res) => {
	// localhost:3000/* (for serving vue spa)
	res.sendFile(__dirname + "/client/index.html");
});

// CATCH 404 AND FORWARD REQUEST TO ERROR HANDLER -------------------------------------------------------------
// REMOVE: Not sure if removing middleware will have serious side effects. will disable temporarily
// app.use((req, res, next) => {
// 	next(createError(404));
// });

// ERROR HANDLER ----------------------------------------------------------------------------------------------
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	res.status(err.status || 500);
	res.render("error");
});

// BOOSTRAPPER ------------------------------------------------------------------------------------------------
async function bootstrap() {
	try {
		console.clear();
		console.log("Starting Application...".black.bgGreen + "\nInitializing connection to database...");

		// initialize database connection
		let connection = await createDBConnection(cfg.DB_NAME, cfg.DB_PORT);

		console.log(
			" SERVER RUNNING ".black.bgGreen + "\n" + 
			"MongoDB Database: " + connection.connection.name + " (connected)".green
		);

		const host_url = 'http://localhost:'.cyan + PORT.brightCyan;
		const net_url = `http://:${ip.address()}:`.cyan + PORT.brightCyan;

		server.listen(PORT, () => {
			console.log(
				"--------------------------------------------------\n" +
				"- local:   " + host_url + "\n" +
				"- network: " + net_url + "\n" +
				"--------------------------------------------------"
			);
		});
	} catch (error) {
		console.log("INTERNAL SERVER ERROR (500)".bgRed);
		console.error(error);
		throw new Error(error);
	}
}

bootstrap();
