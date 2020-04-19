const faker = require("faker");
// import faker from "faker";
const { Employee } = require("../db/models/Employee");
const { EmployeeLog } = require('../db/models/EmployeeLog');

exports.insertEmployeeLogs = async () => {

	console.log('\ninsertEmployeeLogs()');

	return new Promise(async (resolve, reject) => {
		try {

			let employees = await Employee.find({});

			let index = 1;
			let date = null;

			for(const employee of employees) {
				date = faker.date.between('2020-01-01', '2020-12-31');
				let employeeLog = new EmployeeLog({
					employeeRef : employee._id,
					in          : date,
					dateCreated : date
				});

				let timeIn = new Date(employeeLog.in);

				employeeLog.out        = timeIn.setHours(timeIn.getHours() + 7);
				employeeLog.emotionIn  = faker.random.number(5);
				employeeLog.emotionOut = faker.random.number(5);

				await employeeLog.save();

				employee.latestLog = {
					reference: employeeLog._id,
					date: employeeLog.dateCreated
				}

				await employee.save();
				console.log(`Successfully inserted new employee log (${index} - ${employee.email})`);
				++index;
			};

			resolve(true);

		} catch (error) {
			reject(error)
		}

	})


}