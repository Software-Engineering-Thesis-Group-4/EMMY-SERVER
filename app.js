const createError = require('http-errors');
const http        = require('http');
const path        = require('path');
const logger      = require('morgan');
const socketIO    = require('socket.io');
const cors        = require('cors');
const express     = require('express');
const ip          = require('ip');
const dotenv      = require('dotenv');
const helmet      = require('helmet');
const fileUpload  = require('express-fileupload');
const colors      = require('colors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || '3000';

const { createDBConnection } = require('./db');
const DB_NAME = process.env.DB_NAME || "Emmy";


// LOAD ENVIRONMENT VARIABLES ---------------------------------------------------------------------------------
dotenv.config();

// APPLICATION CONFIGURATIONS ---------------------------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client'))); // the directory for Vue
app.use(cors());
app.use(helmet());
app.use(fileUpload({
	debug: true
}));

// IMPORT & CONFIGURE ROUTES ----------------------------------------------------------------------------------
const employeeLogsRoute = require('./routes/employee-logs')(io);
const employeeRoute = require('./routes/employee')(io);
const utilityRoute = require('./routes/main')(io);
const authRoute = require('./routes/auth')(io);

app.use('/auth', authRoute);									// localhost:3000/auth/
app.use('/main', utilityRoute); 								// localhost:3000/utility
app.use('/api/employees', employeeRoute); 				// localhost:3000/api/employees/
app.use('/api/employeelogs', employeeLogsRoute); 		// localhost:3000/api/employeelogs/
app.get(/.*/, (req, res) => {									// localhost:3000/* (for serving vue spa)
	res.sendFile(__dirname + '/client/index.html');
});

// CATCH 404 AND FORWARD REQUEST TO ERROR HANDLER -------------------------------------------------------------
app.use((req, res, next) => {
	next(createError(404));
});

// ERROR HANDLER ----------------------------------------------------------------------------------------------
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	res.status(err.status || 500);
	res.render('error');
});

// BOOSTRAPPER ------------------------------------------------------------------------------------------------
async function bootstrap() {
	try {
		console.log("-------------------------------------------------------------------\n" + "SERVER STARTED".black.bgGreen);
		await createDBConnection(DB_NAME, process.env.DB_PORT);

		server.listen(PORT, () => {
			console.log("-------------------------------------------------------------------");
			console.log("local: " + `http://localhost:`.cyan + `${PORT}`.brightCyan);
			console.log("network: " + `http://${ip.address()}:`.cyan + `${PORT}`.brightCyan)
			console.log("-------------------------------------------------------------------");
		});

	} catch (error) {
		console.log('500 INTERNAL SERVER ERROR.');
		console.error(error);
		throw new Error(error);
	}
}

// EXECUTE APPLICATION ---------------------------------------------------------------------------------------
bootstrap();