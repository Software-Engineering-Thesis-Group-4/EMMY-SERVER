const createError  = require('http-errors');
const http         = require('http');
const path         = require('path');
const logger       = require('morgan');
const socketIO     = require('socket.io');
const cors         = require('cors');
const express      = require('express');
const session 		 = require('express-session');
const MongoStore 	 = require('connect-mongo')(session);

import { v4 as uuidv4 } from 'uuid';

// enable .env config variables
require('dotenv').config();
const PORT = process.env.PORT || '3000';

const app    = express();
const server = http.createServer(app);
const io     = socketIO(server);

// APPLICATION LEVEL CONFIGURATIONS ---------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(morgan('dev'));

// DATABASE ---------------------------------------------------------------------------------------
const { createDBConnection } = require('./db');
createDBConnection(process.env.DB_NAME, process.env.DB_PORT);

// IMPORT ROUTES ----------------------------------------------------------------------------------
const employeeLogsRoute = require('./routes/employee-logs')(io);
const employeeRoute     = require('./routes/employee')(io);
const indexRoute        = require('./routes/main')(io);
const authRoute         = require('./routes/auth')(io);

app.use('/', indexRoute); // localhost:3000/
app.use('/auth', authRoute); // localhost:3000/auth/
app.use('/api/employees', employeeRoute); // localhost:3000/api/employees/
app.use('/api/employeelogs', employeeLogsRoute);// localhost:3000/api/employeelogs/

const user_id = `user-${uuidv4()}`;

// SESSION AND MIDDLEWARE
app.use(session({
	store: new MongoStore({ mongooseConnection: mongoose.connection}),
	key: user_id,
	name: process.env.SESSION_NAME,
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: parseInt(process.env.SESSION_DURATION), // 1hr from .env
		sameSite: false // cors
	}
}));



app.use((req, res, next) => {
	if (req.cookies.cookie === 0 && !req.session.user) {
		 res.clearCookie('user_id');
	}
	next();
});




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
server.listen(PORT, () => {
	console.log(`server listening on port: ${PORT}`);
	console.log(`local: http://localhost:${PORT}/`);
});