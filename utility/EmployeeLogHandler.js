const moment = require('moment');

// IMPORT MODELS
const { Employee } = require('../db/models/Employee.js');
const { EmployeeLog } = require('../db/models/EmployeeLog.js');

// Import Subutility
const { isOverdue } = require('./OverdueEmployeeLog.js');

/**
 * Handles the attendance of the employee when after they scan their fingerprint.
 * @param io - web socket
 * @param fingerprintId - fingerprint number or "fingerprintId" field of the employee
 * @returns "status code" and "status message"
 * @author Nathaniel Saludes
 */

// FIX: Remove promise but convert the whole handleEmployeeLog function as an asynchronous operation and return the necessary data for response.
exports.handleEmployeeLog = async (io, fingerprintId) => {

	try {
		// find employee
		let employee = await Employee.findOne({ fingerprintId });

		// EMPLOYEE DOES NOT EXIST -----------------------------------------------------------------------------------
		if (!employee) {

			io.sockets.emit('logError', {
				message: `You are not currently registered in the system.`
			})

			return {
				status: 404,
				message: `Empoyee not registered!`
			};
		}

		if (employee.employmentStatus === 0) {
			return {
				status: 200,
				message: `Part-time employee!`
			};
		}

		// LATEST LOG NOT INITIALIZED (Recently registered employee) -------------------------------------------------
		if (!employee.latestLog) {

			let clockIn = new EmployeeLog({
				employeeRef: employee._id
			});

			clockIn.save();

			employee.latestLog = {
				reference: clockIn._id,
				date: clockIn.in
			}

			employee.save();

			io.sockets.emit('employeeLog', {
				reference: clockIn._id,
				employee: `${employee.firstName} ${employee.lastName}`,
				status: "in",
			})

			return {
				status: 200,
				message: `Recently registered employee! Recorded new log. (${moment().format('lll')})`
			};
		}

		// get the last recorded log of the employee
		let lastLog = await EmployeeLog.findById(employee.latestLog.reference);

		// EMPLOYEE LOG NOT FOUND -----------------------------------------------------------------------------------
		if (!lastLog) {

			let clockIn = new EmployeeLog({
				employeeRef: employee._id
			});

			clockIn.save();

			employee.latestLog = {
				reference: clockIn._id,
				date: clockIn.in
			}

			employee.save();

			io.sockets.emit("employeeLog", {
				reference: clockIn._id,
				employee: `${employee.firstName} ${employee.lastName}`,
				status: "in",
			})

			return {
				status: 404,
				message: `Employee log LOST. ${employee.firstName} ${employee.lastName} clocked-in. (${moment().format('lll')})`
			};
		}

		// PEFORM VALIDATIONS --------------------------------------------------------------------------------------
		let timeIn = lastLog.in;
		let timeOut = lastLog.out;

		// no time-out
		if (!timeOut) {

			let overdue = isOverdue(timeIn);

			if (overdue) {

				let clockIn = new EmployeeLog({
					employeeRef: employee._id
				});

				clockIn.save();

				employee.latestLog = {
					reference: clockIn._id,
					date: clockIn.dateCreated
				}

				employee.save();

				io.sockets.emit('employeeLog', {
					reference: lastLog._id,
					employee: `${employee.firstName} ${employee.lastName}`,
					status: "in",
				});

				return {
					status: 200,
					message: `
							${employee.firstName} ${employee.lastName} did not clock-out yesterday (${moment().format('LL')}).
							New log recorded! [${clockIn.in}]
						`
				};

			} else {

				lastLog.out = new Date();
				lastLog.save();

				io.sockets.emit('employeeLog', {
					reference: lastLog._id,
					employee: `${employee.firstName} ${employee.lastName}`,
					status: "out",
				})

				return {
					status: 200,
					message: `${employee.firstName} ${employee.lastName} successfully clocked-out! (${moment().format('lll')})`
				}
			}

		} else {

			let now = new Date();

			if (moment(now).isSame(timeOut, 'day')) {

				io.sockets.emit('logError', {
					message: `Sorry! you have already checked-out for the day. Please try again tomorrow.`,
				})

				return {
					status: 400,
					message: `Sorry! you have already checked-out for the day. Please try again tomorrow.`
				};

			} else {

				let clockIn = new EmployeeLog({
					employeeRef: employee._id
				});

				clockIn.save();

				employee.latestLog = {
					reference: clockIn._id,
					date: clockIn.in
				}

				employee.save();

				io.sockets.emit('employeeLog', {
					reference: lastLog._id,
					employee: `${employee.firstName} ${employee.lastName}`,
					status: "in",
				})

				return {
					status: 200,
					message: `${employee.firstName} ${employee.lastName} successfully clocked-in! (${moment().format('lll')})`
				}

			}

		}

	} catch (error) {
		throw new Error({
			status: 500,
			message: `Server Error: \n${error.message}`
		})
	}
} // end