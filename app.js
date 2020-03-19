const createError = require('http-errors');
const http        = require('http');
const path        = require('path');
const logger      = require('morgan');
const socketIO    = require('socket.io');
const cors        = require('cors');
const express     = require('express');
const dotenv      = require('dotenv');
const helmet      = require('helmet');
const fileUpload   = require('express-fileupload');

const app 	 = express();
const server = http.createServer(app);
const io 	 = socketIO(server);

// LOAD ENVIRONMENT VARIABLES
dotenv.config();

// APPLICATION LEVEL CONFIGURATIONS ---------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(helmet());
app.use(fileUpload({
	debug		: true
}));

// DATABASE ---------------------------------------------------------------------------------------
const { createDBConnection } = require('./db');
let DB_NAME = process.env.DB_NAME || "Emmy";
createDBConnection(DB_NAME, process.env.DB_PORT);


// DB backup runs every 2:00am ----- Timezone: Asia/Kuala Lumpur
//require('./utility/cronScheduler');

// IMPORT ROUTES ----------------------------------------------------------------------------------
const employeeLogsRoute = require('./routes/employee-logs')(io);
const employeeRoute     = require('./routes/employee')(io);
const utilityRoute      = require('./routes/main')(io);
const authRoute         = require('./routes/auth')(io);


app.use('/auth', authRoute);									// localhost:3000/auth/
app.use('/utility', utilityRoute); 							// localhost:3000/utility
app.use('/api/employees', employeeRoute); 				// localhost:3000/api/employees/
app.use('/api/employeelogs', employeeLogsRoute); 		// localhost:3000/api/employeelogs/

// TODO: add route for servering a single page application (Vue)
// code here...

/* CATCH 404 AND FORWARD REQUEST TO ERROR HANDLER --------------------------------------------------
	DESCRIPTION:
	- If the user tries to access unknown routes aside from the available routes above,
	  it will be directed to this middleware.
*/
app.use((req, res, next) => {
	next(createError(404));
});


/* ERROR HANDLER -----------------------------------------------------------------------------------
	DESCRIPTION:
	- This is the error handling middleware.
*/
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});


// LISTEN -----------------------------------------------------------------------------------------
const PORT = process.env.PORT || '3000';

server.listen(PORT, () => {
	console.log(`server listening on port: ${PORT}`);
	console.log(`local: http://localhost:${PORT}/`);
});