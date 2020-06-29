const mongoose = require('mongoose');
const { User } = require('../db/models/User');
const bcrypt = require('bcryptjs');
require('colors');

exports.createDBConnection = async (db_name, port) => {
	try {
		// scheduled server task
		const connection = await mongoose.connect(`mongodb://localhost:${port}/${db_name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});

		// check if there are any existing administrators
		const existingUsers = await User.findOne({ isAdmin: true });
		const hashed_password = bcrypt.hashSync("administrator");
		if (!existingUsers) {
			const root_admin = new User({
				firstname: "ROOT",
				lastname: "ADMIN",
				username: "ROOT_ADMIN",
				email: "root_admin@emmy.com",
				password: hashed_password,
				isAdmin: true,
			});

			await root_admin.save();
		}

		console.clear();
		return connection;

	} catch (error) {
		console.clear();
		console.log('Failed to initialize connection from MongoDB'.bgRed);
		throw new Error(error);
	}
}

exports.closeDBConnection = async () => {
	try {
		console.log('closing connection...');
		await mongoose.connection.close();
		console.log('database connection closed.');
		console.log("-------------------------------------------------------------------");
	} catch (error) {
		throw new Error(error);
	}
}