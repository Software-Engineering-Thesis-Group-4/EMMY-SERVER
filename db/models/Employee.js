const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// LATEST LOG SCHEMA ---------------------
const LatestLogSchema = new Schema({
	reference: {
		type: Schema.Types.ObjectId,
		ref: 'EmployeeLog',
	},
	date: Date,
});

// EMPLOYEE SCHEMA -----------------------
const EmployeeSchema = new Schema({
	employeeId: {
		type: String,
		unique: true,
		required: true
	},
	firstname: {
		type: String,
		required: true
	},
	lastname: {
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
	latestLog: {
		type: LatestLogSchema,
		default: null,
	},
	negativeEmotionCounter: {
		type: Number,
		default: 0
	},
	sendAutoEmail: {
		type: Boolean,
		default: false
	},
	deleted: {
		type: Boolean,
		default: false,
	},
});

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = {
	EmployeeSchema,
	Employee
}