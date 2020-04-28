const mongoose = require('mongoose');
require('colors');

exports.createDBConnection = async (db_name, port) => {
	try {
		const connection = await mongoose.connect(`mongodb://localhost:${port}/${db_name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});

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