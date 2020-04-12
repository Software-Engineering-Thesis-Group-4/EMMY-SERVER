const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// path to csv file ---- static public files
const pathCsv = path.join(__dirname, '/../public');

// import utility 
const { encrypt, decrypter } = require('./aes')

// import model
const { Employee } = require('../db/models/Employee');

// FIX: Avoid using request and response object inside utility modules
const csvImport = (csvFile) => {

	fs.createReadStream(csvFile)
		.pipe(csv({
			strict: true
		}))
		.on('data', (data) => {

			const empId = encrypt(data.employee_id);
			const firstName = encrypt(data.firstname);
			const lastName = encrypt(data.lastname);
			const email = encrypt(data.email);
			const fingerprintId = encrypt(parseInt(data.fingerprint_id))

			const newEmp = new Employee({
				employeeId: empId,
				firstName: firstName,
				lastName: lastName,
				email: email,
				isMale: data.isMale,
				employmentStatus: parseInt(data.employment_status),
				department: data.department,
				jobTitle: data.job_title,
				photo: data.photo,
				fingerprintId: fingerprintId,
				terminated: data.terminated
			});

			newEmp.save()
				.then((emp) => {
					console.log(`Added employee ${decrypter(emp.firstName)}`);
				})
				.catch(err => res.send("invalid value in csv"));
		})
		.on('end', () => {
			console.log('Succesfully read csv file')
		});
}

// FIX: Avoid using request and response object inside utility modules
const isValidCsv = (csvFile, res) => {
	const headerVal = 'employee_id,firstname,lastname,'
		+ 'email,isMale,employment_status,'
		+ 'department,job_title,photo,fingerprint_id,terminated';

	fs.createReadStream(csvFile)
		.pipe(csv({
			strict: true
		}))
		.on('headers', (header) => {
			// check if format of csv is correct
			if (header.toString() === headerVal) {
				csvImport(csvFile);
				console.log('Imported csv file data')
				res.send('success')
			}
			else {
				res.send('Invalid csv format')
			}
		})

}




module.exports = {
	isValidCsv
}