const { createDBConnection, closeDBConnection } = require('../db/index.js');
require('dotenv').config();

// should this just delete the employees or including their logs?

const { Employee } = require('../db/models/Employee');
//const { EmployeeLog } = require('../db/models/EmployeeLog');


async function deleteAllEmployeeData() {

   try{
      await createDBConnection(process.env.DB_NAME, process.env.DB_PORT);
      Employee.deleteMany({}, function (err) {
         if(err){
            console.error('Delete Employees Failed')
            console.log(err)
         }else{
            console.log('Delete Employees DONE');
         }
      });

      EmployeeLog.deleteMany({}, function(err) {
         if(err){
            console.error('Delete Logs FAILED');
            console.log(err);
         } else {
            console.log('Delete Logs DONE');
         }
      });

      await closeDBConnection();
   } catch(error){
      console.log(error);
   }

}

deleteAllEmployeeData();