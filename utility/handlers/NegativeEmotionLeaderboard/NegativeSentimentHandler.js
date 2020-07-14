const { Employee } = require("../../../db/models/Employee");


async function incrementCounter(employeeId) {
	const employee = await Employee.findById(employeeId);
	if (!employee) {
		const error = new Error('Employee does not exists.');
		error.name = "EmployeeNotFound";
		throw error;
	}

	let counter = employee.negativeEmotionCounter;
	employee.negativeEmotionCounter = ++counter;
	employee.sendAutoEmail = true;

	await employee.save();
	return true;
}

module.exports = incrementCounter;