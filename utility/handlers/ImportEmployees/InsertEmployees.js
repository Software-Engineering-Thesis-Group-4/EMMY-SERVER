const { Employee } = require("../../../db/models/Employee");

async function insertEmployees(rows) {
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

		let newUser = new Employee({
			employeeId: EMPLOYEE_ID,
			firstname: FIRSTNAME,
			lastname: LASTNAME,
			email: EMAIL,
			isMale: (GENDER === "M" ? true : false),
			employmentStatus: (EMPLOYMENT_STATUS === "Full-time" ? 0 : 1),
			department: DEPARTMENT.toUpperCase(),
			jobTitle: JOB_TITLE,
			fingerprintId: FINGERPRINT_ID,
		});

		saveEmployees.push(newUser.save());
	}

	const documents = await Promise.all(saveEmployees);
	return documents;
}

module.exports = insertEmployees;