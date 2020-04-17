const mongoose = require('mongoose');
require('colors');

exports.createDBConnection = async (db_name, port) => {
	try {
		//console.time('Mongoose connection startup');
		const connection = await mongoose.connect(`mongodb://localhost:${port}/${db_name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});

		console.clear();
		//console.timeEnd('Mongoose connection startup');
		return connection;

	} catch (error) {
		return error.message;
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