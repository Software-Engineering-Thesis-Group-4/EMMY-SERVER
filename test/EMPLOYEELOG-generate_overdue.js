const moment = require('moment');
const mongoose = require('mongoose');
const { EmployeeLog } = require('../db/models/EmployeeLog');
const { Employee } = require('../db/models/Employee');

const createDBConnection = async (port, dbName) => {
   try {
      mongoose.set('useCreateIndex', true);
      mongoose.set('useFindAndModify', false);

      // get db connection
      const connection = await mongoose.connect(`mongodb://localhost:${port}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
      // prevent deprecation warnings (from MongoDB native driver)

      console.log(`Successfully connected to MongoDB database! [${dbName}]\n------------------------------------------`);

      return connection;

   } catch (error) {
      console.error(error);
      throw new Error(error);
   }
}

async function main() {
   try {
      console.log(`creating connection!`);
      await createDBConnection(27017, "Emmy");

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

   } catch (error) {
      console.error(error)
   }
}

main();