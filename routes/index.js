// THIS FILE SERVES AS A "BARREL" FOR EXPORTING ALL ROUTES FROM A SINGLE FILE

module.exports = (io) => {
   const employeeLogsRoute = require('./employee_logs')(io);
   const employeeRoute     = require('./employee')(io);
   const authRoute         = require('./auth')(io);
   const indexRoute        = require('./main')(io);

   return {
      employeeRoute,
      employeeLogsRoute,
      authRoute,
      indexRoute
   }
}