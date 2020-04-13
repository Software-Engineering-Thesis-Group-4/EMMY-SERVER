const createError = require('http-errors');
const http        = require('http');
const path        = require('path');
const logger      = require('morgan');
const socketIO    = require('socket.io');
const cors        = require('cors');
const express     = require('express');
const dotenv      = require('dotenv');
const helmet      = require('helmet');
const app 		  = express();
const server      = http.createServer(app);
const io          = socketIO(server);


// LOAD ENVIRONMENT VARIABLES ---------------------------------------------------------------------------------
dotenv.config();


const PORT 							= process.env.PORT || '3000';
const { createDBConnection } 		= require('./db');
const DB_NAME 						= process.env.DB_NAME || "Emmy";
const mode 							= process.env.MODE;

// APPLICATION CONFIGURATIONS ---------------------------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(helmet());

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

// TODO: add route for servering a single page application (Vue)
// code here...

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
		console.log("-------------------------------------------------------------------");
		await createDBConnection(DB_NAME, process.env.DB_PORT);

		server.listen(PORT, () => {
			console.log("-------------------------------------------------------------------");
			console.log(`server listening on port: ${PORT}`);
			console.log(`local: http://localhost:${PORT}/`);
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