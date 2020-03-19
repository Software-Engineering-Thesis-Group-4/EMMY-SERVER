const moment = require('moment');
const mongoose = require('mongoose');
const { createDBConnection } = require('../db/index.js');

const { EmployeeLog } = require('../db/models/EmployeeLog');
const { Employee } = require('../db/models/Employee');

// configurations
const DB_PORT = 27017;
const DB_NAME = "Emmy";

// unit test
async function main() {
   try {
      console.log(`Connecting to database...`);
      await createDBConnection(DB_PORT, DB_NAME);

      /* -------------------------------------------------------------------------------------------------------
      TEST: OVERDUE DATE
      - Create an employee log 1 day and 9 hours late (with no clock-out time)
      --------------------------------------------------------------------------------------------------------*/
      let yesterday = moment(new Date()).subtract({
         days: 1,
         hours: 9
      });
      
      let employeeLog = new EmployeeLog({
         employee: "5e62ec3fc7fab75a78bd0519",
         employeeId: 201502034,
         in: yesterday.format(),
         dateCreated: yesterday.format()
      });
      
      employeeLog.save();
      console.log('employeeLog saved!');
      
      let employee = await Employee.findById("5e49f35fa182182ea436b5b0");
      
      console.log(employee)
      
      employee.latestLog = {
         reference: employeeLog._id,
         date: employeeLog.dateCreated
      }
      
      employee.save();
      console.log('employee updated!');
      /* ---------------------------------------------------------------------------------------------------- */
      
   } catch (error) {
      console.error(error);
   }
}

// start test process
main();