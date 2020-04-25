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
   employeeId: {
      type: String,
      unique: true,
      required: true
   },
   firstName: {
      type: String,
      required: true
   },
   lastName: {
      type: String,
      required: true
   },
   email: {
		type: String,
		unique: true,
      required: true
   },
   isMale: {
      type: Boolean,
      required: true
   },
   employmentStatus: {
      type: Number, // 1=full-time, 0=part-time
      required: true
   },
   department: {
      type: String,
      required: true
   },
   jobTitle: {
      type: String,
      required: true
   },
   photo: {
      type: String,
      default: null
   },
   fingerprintId: {
      type: Number,
      unique: true,
      required: true
   },
   terminated: {
      type: Boolean,
      default: false,
   },
   latestLog: {
      type: LatestLogSchema,
      default: null,
   },
});

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = {
   EmployeeSchema,
   Employee
}