const { User } = require('../../db/models/User');
const bcrypt = require('bcryptjs');

async function initializeAdmin() {

	// check if there are any existing administrators
	const rootAdmin = await User.findOne({ isAdmin: true });

	if (!rootAdmin) {
		const hashed_password = bcrypt.hashSync(process.env.PASSWORD);
		const new_user = new User({
			firstname: process.env.FIRSTNAME,
			lastname: process.env.LASTNAME,
			username: process.env.USERNAME,
			email: process.env.EMAIL,
			password: hashed_password,
			isAdmin: true,
		});

		await new_user.save();
		console.log('New root adminstrator initialized.');
		return;
	}

	return;
}

module.exports = initializeAdmin;