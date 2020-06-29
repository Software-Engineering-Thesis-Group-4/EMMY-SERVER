const { Employee } = require("../../../db/models/Employee");

const ValidateDatabaseDuplicates = async (rows) => {
	const duplicates = new Set();

	for (let index = 0; index < rows.length; index++) {
		const {
			EMPLOYEE_ID,
			FINGERPRINT_ID,
			EMAIL
		} = rows[index];

		const user = await Employee.findOne({
			$or: [
				{ employeeId: EMPLOYEE_ID },
				{ fingerprintId: FINGERPRINT_ID },
				{ email: EMAIL },
			]
		});

		if (user) {
			duplicates.add(rows[index]);
		}
	}

	if (duplicates.size) {
		const error = new Error();
		error.message = "Employees already exists."
		error.name = "DatabaseDuplicateError";
		error.duplicates = [...duplicates];
		throw error;
	}
}

module.exports = ValidateDatabaseDuplicates;