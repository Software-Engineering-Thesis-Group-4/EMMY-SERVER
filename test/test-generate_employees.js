const faker = require("faker");
const { Employee } = require("../db/models/Employee");

function randomGender() {
	let gender;

	let num = Math.floor(Math.random() * 2);
	if (num == 1) {
		gender = false; //female
	}
	else {
		gender = true; //male
	}
	return gender;
}

function randomDepartment() {

	let department = [
		'Admissions',
		'Registrar',
		'Finance',
		'Human Resources',
		'Office of Student Affairs',
		'Office of Student Experience and Advancement',
		'Office of the President',
		'Office of the COO',
		'IT',
		'Corporate Communications',
		'Purchasing',
		'Admin and Facilities',
		'Academics College',
		'Academics SHS',
		'Clinic'
	];

	let random = Math.floor(Math.random() * department.length);
	let selected = department[random];

	return selected;
}

exports.insertRandomEmployees = async (numberOfEmployees) => {

	console.log('\ninsertRandomEmployees()');
	try {
		for (let i = 0; i < numberOfEmployees; ++i) {
			let employee = new Employee({
				employeeId: faker.random.uuid(),
				firstName: faker.name.firstName(),
				lastName: faker.name.lastName(),
				email: faker.internet.email(),
				isMale: randomGender(),
				employmentStatus: Math.floor(Math.random() * 2),   // random part time or full time
				department: randomDepartment(),
				jobTitle: faker.name.jobTitle(),
				fingerprintId: i,
				terminated: false,
				latestLog: null
			});

			await employee.save();
			console.log(`Employee saved (${i + 1})`);
		}

		return true; // return true if success

	} catch (error) {
		return false; // return false if error
	}
}