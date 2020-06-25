const moment = require('moment');

// models
const { EmployeeLog } = require('../../../db/models/EmployeeLog');
const { Employee } = require('../../../db/models/Employee');

// utilities
const { verifyOverdue } = require('./VerifyOverdue');

async function AttendanceHandler(fingerprint_id) {

	// check if fingerprint id/number is falsy
	if (fingerprint_id < 0 || fingerprint_id === undefined || isNaN(fingerprint_id)) {
		const error = new Error('Fingerprint ID/Number is invalid.');
		error.name = "InvalidFingerprintId";
		throw error;
	}

	// get employee using the provided fingerprint id/number
	const employee = await Employee.findOne({ fingerprintId: fingerprint_id });

	// check if employee exists
	if (!employee) {
		const error = new Error('Employee does not exist.');
		error.name = "EmployeeNotFound";
		throw error;
	}

	// check if latest log reference does not exist
	if (!employee.latestLog) {
		await LogAttendance(employee);

		return {
			success: true,
			message: "New time-in created.",
			employee
		}
	}

	// if the latest log reference is initialized
	const mostRecentLog = await EmployeeLog.findById(employee.latestLog.reference);

	// if most recent log does not exist (deleted) create a new one
	if (!mostRecentLog) {
		await LogAttendance(employee);

		return {
			success: true,
			message: `Employee log reference not found (${employee.email}). Time-in created.`,
			employee
		}
	}

	// if time-out is not initialized, check if overdue
	if (!mostRecentLog.timeOut) {
		if (verifyOverdue(mostRecentLog.timeIn)) {
			await LogAttendance(employee);

			return {
				success: true,
				message: `Time-out overdue. New time-in created.`,
				employee
			}
		}

		mostRecentLog.timeOut = moment().format();
		await mostRecentLog.save();

		return {
			success: true,
			message: `Successfully logged employee time-out.`,
			employee
		}
	}

	// if time-out is already recorded, check if day today is already past the day of employee log
	if (moment().isAfter(mostRecentLog.dateCreated, 'day')) {
		await LogAttendance(employee);

		return {
			success: true,
			message: `Successufully logged employee time-in`,
			employee
		}
	}

	// throw an error if an employee exceeds the "2 logs per day policy".
	const error = new Error('Invalid employee log. Cannot create multiple instance of employee log in a day.');
	error.name = "MultipleEmployeeLogError"
	throw error;
}


async function LogAttendance(employee) {
	const employee_log = new EmployeeLog({
		employeeRef: employee._id,
	});

	await employee_log.save();

	employee.latestLog = {
		reference: employee_log._id,
		date: employee_log.in
	}

	await employee.save();

	// if employee is a full-time/regular employee
	if (employee.employmentStatus === 1) {
		// TODO: Emit a socket event
	}
}

module.exports = {
	AttendanceHandler
}