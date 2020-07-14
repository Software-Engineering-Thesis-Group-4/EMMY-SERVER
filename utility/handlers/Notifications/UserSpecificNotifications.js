const { EmployeeDataNotification } = require('../../../db/models/EmployeeDataNotif');
const { User } = require('../../../db/models/User');

async function createCrudNotification(operation, email, employee_id) {
	const user = await User.findOne({ email: email });

	const notification = new EmployeeDataNotification({
		author: user._id,
		employee: employee_id,
		operation
	});

	await notification.save();
}

module.exports = createCrudNotification;