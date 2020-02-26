const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// LATEST LOG SCHEMA ---------------------
const LatestLogSchema = Schema({
   reference: {
      type: Schema.Types.ObjectId,
      ref: 'EmployeeLog',
   },
   date: Date,
});

// EMPLOYEE SCHEMA -----------------------
const EmployeeSchema = Schema({
   employeeId      : String,
   firstName       : String,
   lastName        : String,
   email           : String,
   isMale          : Boolean,
   employmentStatus: Number,    // 1=full-time, 0=part-time
   department      : String,
   jobTitle        : String,
   photo           : String,
   fingerprintId   : Number,
   terminated      : {
      type: Boolean,
      default: false,
   },
   latestLog       : {
      type   : LatestLogSchema,
      default: null,
   },
});


const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = {
   EmployeeSchema,
   Employee
}