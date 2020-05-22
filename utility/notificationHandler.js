const { EmployeeDataNotification } = require('../db/models/EmployeeDataNotif');
const { EmotionNotification } = require('../db/models/EmotionNotification');
const { Employee } = require("../db/models/Employee");
//const { User } = require("../db/models/User");


// saving event to db
exports.save_employeeNotif = async (action, admin_id, employee_id) => {
	try {

		const employee = await Employee.findOne({ employeeId : employee_id });

		let event = await EmployeeDataNotification({
			date: new Date(),
			author: admin_id,
			employee: employee._id,
			operation: action,
		});

		event.save();
		console.log("Successfully saved Employee CRUD event to DB: NotifHandler");
		//return true;

	} catch (error) {
		console.log(error);
		console.error("Error saving Employee CRUD Notification: NotifHandler");
		//return false;
	}
};

// WORKS FINE
exports.save_emotionNotif = async (emotion, employeeID) => {
	try {

		let employeeObjectID = await Employee.findOne({ employeeId: employeeID });

		let event = await EmotionNotification({
			date: new Date(),
			employee: employeeObjectID,
			emotion: emotion
		});

		event.save();
		console.log("Successfully saved Employee Notification to DB: NotifHandler");
		//return true;

	} catch (error) {
		console.log(error);
		console.error("Error fetching emotion notification: NotifHandler");
		//return false;
	}
};
