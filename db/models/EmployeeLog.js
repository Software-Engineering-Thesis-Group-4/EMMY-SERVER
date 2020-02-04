const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeLogSchema = Schema({
   employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
   },
   employeeId: String,
   in: Date,
   out: Date,
   emotionIn: {
      type: Number,
      default: 0
   },
   emotionOut: {
      type: Number,
      default: 0
   },
   dateCreated: {
      type: Date,
      default: Date.now
   },
});

const EmployeeLog = mongoose.model('EmployeeLog', EmployeeLogSchema);

module.exports = {
   EmployeeLogSchema,
   EmployeeLog
}