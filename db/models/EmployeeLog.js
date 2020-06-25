const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeLogSchema = new Schema({
   employeeRef: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      autopopulate: true,
      required: true
   },
   timeIn: {
      type: Date,
      default: Date.now
   },
   timeOut: {
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


EmployeeLogSchema.plugin(require('mongoose-autopopulate'));

const EmployeeLog = mongoose.model('EmployeeLog', EmployeeLogSchema);

module.exports = {
   EmployeeLogSchema,
   EmployeeLog
}