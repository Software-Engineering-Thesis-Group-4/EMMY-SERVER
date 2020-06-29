const fs = require('fs');
const path = require('path');
const csv = require('neat-csv');
require('colors');

const ValidateDuplicates = require('../utility/handlers/ImportEmployees/ValidateDuplicates');
const ValidateDatabaseDuplicates = require('../utility/handlers/ImportEmployees/ValidateDatabaseDuplicates');


(async () => {

	const files = [
		'test_duplicate_values.csv',
		'test_empty_file.csv',
	]

	console.log('TESTS ================================================');
	files.forEach(async (item) => {
		try {
			// start reading the file
			const data = fs.readFileSync(path.resolve(__dirname, item), 'utf8');
			const rows = await csv(data, {
				strict: true,
				skipComments: true,
				separator: ",",
				mapHeaders: ({ header }) => header.toUpperCase()
			});

			// check if there are no rows (no data)
			if (rows && rows.length <= 0) {
				const error = new Error('Invalid Format. File is empty.')
				error.name = "EmptyFileError";
				throw error;
			}

			// check duplicates
			ValidateDuplicates(rows);
			ValidateDatabaseDuplicates(rows);

		}
		catch (error) {
			switch (error.name) {
				case "DuplicateValidationError":
					console.log(`${"ERROR".bgRed.black} DuplicateValidationError`)
					break;

				case "InvalidFileType":
					console.log(`${"ERROR".bgRed.black} InvalidFileType`)
					break;

				case "EmptyFileError":
					console.log(`${"ERROR".bgRed.black} EmptyFileError`)
					break;

				case "DatabaseDuplicateError":
					console.log(`${"ERROR".bgRed.black} DatabaseDuplicateError`)
					break;

				default:
					console.log(`${"ERROR".bgRed.black} ${error.name}: ${error.message}`)
					console.error(error.stack);
			}
		}
	});
})();