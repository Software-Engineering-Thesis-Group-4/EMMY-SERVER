const { Employee } = require("../../../db/models/Employee");

async function insertEmployees(rows) {
	const duplicates = new Set();
	const saveEmployees = [];

	for (let index = 0; index < rows.length; index++) {
		const {
			EMPLOYEE_ID,
			FIRSTNAME,
			LASTNAME,
			EMAIL,
			GENDER,
			EMPLOYMENT_STATUS,
			DEPARTMENT,
			JOB_TITLE,
			FINGERPRINT_ID,
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
			continue;
		}

		let newUser = new Employee({
			employeeId: EMPLOYEE_ID,
			firstname: FIRSTNAME,
			lastname: LASTNAME,
			email: EMAIL,
			isMale: (GENDER === "M" ? true : false),
			employmentStatus: (EMPLOYMENT_STATUS === "Full-time" ? 0 : 1),
			department: DEPARTMENT,
			jobTitle: JOB_TITLE,
			fingerprintId: FINGERPRINT_ID,
		});

		saveEmployees.push(newUser.save());
	}

	if (duplicates.size) {
		const error = new Error();
		error.message = "Employees already exists."
		error.name = "DatabaseDuplicateError";
		error.duplicates = [...duplicates];
		throw error;
	} else {
		const documents = await Promise.all(saveEmployees);
		return documents;
	}

}

module.exports = insertEmployees;