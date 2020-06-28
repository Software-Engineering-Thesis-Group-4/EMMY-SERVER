const fs = require('fs');
const csv = require('neat-csv');

const ValidateDuplicates = require('./ValidateDuplicates');
const insertEmployees = require('./InsertEmployees');

async function importEmployees(file) {
	// check if file type is CSV
	if (file.mimetype !== "text/csv") {
		const error = new Error('Invalid Format. Invalid file type.');
		error.name = "InvalidFileType";
		throw error;
	}

	// read csv file and parse
	const data = fs.readFileSync(file.path, 'utf8');
	let rows = await csv(data, {
		strict: true,
		skipComments: true,
		separator: ",",
		mapHeaders: ({ header }) => header.toUpperCase()
	});

	// check if there are no rows (no data)
	if(rows && rows.length <= 0) {
		const error = new Error('Invalid Format. File is empty.')
		error.name = "EmptyFileError";
		throw error;
	}

	// validate for duplicate values for required unique fields
	const duplicates = await ValidateDuplicates(rows);

	if(duplicates.EMPLOYEE_ID.length || duplicates.FINGERPRINT_ID.length || duplicates.EMAIL.length) {
		const error = new Error('Invalid Format. Duplicate values found for unique fields.')
		error.name = "DuplicateValidationError";
		error.duplicate_fields = duplicates;
		throw error;
	}	
	
	// if validations are success, insert data to database
	return await insertEmployees(rows);
}

module.exports = importEmployees;