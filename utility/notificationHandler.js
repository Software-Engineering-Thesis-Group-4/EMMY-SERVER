// Already in mongooseQue
// const { EmployeeDataNotification } = require('../db/models/EmployeeDataNotif');
// const { EmotionNotification } = require('../db/models/EmotionNotification');
// const { Employee } = require("../db/models/Employee");
//const { User } = require("../db/models/User");
const db = require('./mongooseQue');

// saving event to db
exports.save_employeeNotif = async (action, admin_objectId, employee_objectId) => {
	try {

			const event = await db.save('employeedatanotification',{
				dateCreated: new Date(),
				author: admin_objectId,
				employee: employee_objectId,
				operation: action.toString(),
			})

			if(event.value){
				console.error(`ERROR: On saving Employee CRUD Notification: NotifHandler\n ERRMESSAGE: ${event.message}`);
				return { value: true, message: event.message };
			}
			console.log("Successfully saved Employee CRUD event to DB: NotifHandler");
			return { value: false, output: event.output };
		//}

		//return { value: true, message: employee.message };

	} catch (error) {
		console.log(error);
		console.error("Error saving Employee CRUD Notification: NotifHandler");
	}
};

// WORKS FINE
exports.save_emotionNotif = async (emotion, employee_objectId) => {
	try {

		//const employeeObjectID = await db.findOne('Employee',{ employeeId : employeeID });
		const employee = await db.findById('employee', employee_objectId);

		if(employee.value){
			console.log('No document found')
		} else {

			const event = await db.save('emotionnotification',{
				dateCreated: new Date(),
				employee: employee.output._id,
				emotion: emotion
			})

			event.value ?
			console.log(`ERROR: On saving emotion notification in database \n ERRMESSAGE: ${event.message}`) :
			console.log("Successfully saved Employee Notification to DB: NotifHandler");

		}

	} catch (error) {
		console.log(error);
		console.error("Error fetching emotion notification: NotifHandler");
	}
};
