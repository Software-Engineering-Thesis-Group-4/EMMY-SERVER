const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeLogSchema = Schema({
   employeeRef: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
   },
   in: {
      type: Date,
      default: Date.now
   },
   out: {
      type: Date,
      default: null
   },
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
	deleted: {
		type: Boolean,
		default: false
	}
});

const EmployeeLog = mongoose.model('EmployeeLog', EmployeeLogSchema);

module.exports = {
   EmployeeLogSchema,
   EmployeeLog
}