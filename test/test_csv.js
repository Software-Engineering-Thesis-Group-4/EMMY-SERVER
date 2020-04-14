const faker = require("faker");

function randomGender() {
   let gender = true; //male default

	let num = Math.floor(Math.random() * 2);
   if (num == 1) {gender = false;}//female

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

console.log("\nEmployee_ID | FirstName | LastName | Email | Gender | Employment_Status | Department | JobTitle | Fingerprint_ID");

let numberOfEmployees = 100;
for (let i = 1; i <= numberOfEmployees; i++) {

   const csvData = {
      employeeId       : faker.random.uuid(),
      firstName        : faker.name.firstName(),
      lastName         : faker.name.lastName(),
      email            : faker.internet.email(),
      isMale           : randomGender(),
      employmentStatus : Math.floor(Math.random() * 2),
      department       : randomDepartment(),
      jobTitle         : faker.name.jobTitle(),
      fingerprintId    : i,
   };

   //comma separated
   console.log(`${csvData.employeeId},${csvData.firstName},${csvData.lastName},${csvData.email},${csvData.isMale},${csvData.employmentStatus},${csvData.department},${csvData.jobTitle},${csvData.fingerprintId}`);
}
