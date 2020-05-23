const { EmployeeDataNotification } = require('../db/models/EmployeeDataNotif');
const { EmotionNotification } = require('../db/models/EmotionNotification');
const { Employee } = require("../db/models/Employee");
//const { User } = require("../db/models/User");
const db = require('./mongooseQue');

// saving event to db
exports.save_employeeNotif = async (action, admin_id, employee_id) => {
	try {

		const employee = await db.findOne('Employee',{ employeeId : employee_id });

		if(employee.value){
			// no emplyoee found
		} else {

			const event = await db.save('employeedatanotif',{
				date: new Date(),
				author: admin_id,
				employee: employee.output._id,
				operation: action,
			})

			event.value ?
			console.error(`ERROR: On saving Employee CRUD Notification: NotifHandler\n ERRMESSAGE: ${event.message}`) :
			console.log("Successfully saved Employee CRUD event to DB: NotifHandler");
		
		}

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

		const employeeObjectID = await db.findOne('Employee',{ employeeId : employeeID });

		if(employeeObjectID.value){
			console.log('No document found')
		} else {

			const event = await db.save('emotionnotification',{
				date: new Date(),
				employee: employeeObjectID.output._id,
				emotion: emotion
			})

			event.value ?
			console.log(`ERROR: On saving emotion notification in database \n ERRMESSAGE: ${event.message}`) : 
			console.log("Successfully saved Employee Notification to DB: NotifHandler");

		}
		


		
		//return true;

	} catch (error) {
		console.log(error);
		console.error("Error fetching emotion notification: NotifHandler");
		//return false;
	}
};
