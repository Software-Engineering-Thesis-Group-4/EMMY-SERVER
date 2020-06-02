const moment = require('moment');
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
      await createDBConnection(DB_NAME, DB_PORT);

      /* -------------------------------------------------------------------------------------------------------
      TEST: OVERDUE DATE
      - Create an employee log 1 day and 9 hours late (with no clock-out time)
      --------------------------------------------------------------------------------------------------------*/
      let yesterday = moment(new Date()).subtract({
         days: 1,
         hours: 9
      });

      let employee = await Employee.findOne({ email: "saludesnathaniel@gmail.com" });

      console.log(employee)
      
      let employeeLog = new EmployeeLog({
         employeeRef: employee._id,
         in: yesterday.format(),
         dateCreated: yesterday.format()
      });
      
      // save employee log
      employeeLog.save();
      console.log('employeeLog saved!');
      
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