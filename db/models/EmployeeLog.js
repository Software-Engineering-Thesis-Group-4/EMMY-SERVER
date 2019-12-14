const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeLogSchema = Schema({
   in: Date,
   out: Date,
   // emotionIn: Number,
   // emotionOut: Number,
   date: {
      type: Date,
      default: Date.now
   },
   employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
   },
});

const EmployeeLog = mongoose.model('EmployeeLog', EmployeeLogSchema);

module.exports = {
   EmployeeLogSchema,
   EmployeeLog
}