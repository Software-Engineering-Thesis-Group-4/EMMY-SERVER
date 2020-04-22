const createCsvWriter 	= require('csv-writer').createObjectCsvWriter;
const fs 			 	= require('fs');
const childProc 		= require('child_process')
const path 				= require('path');


// path to csv file ---- static public files
const pathCsv = path.join(__dirname, '/../public');

const csvWriter = createCsvWriter({
	path: './public/generated.csv',
	header: [
		{ id: 'employeeId', title: 'employee_id' },
		{ id: 'firstName', title: 'firstname' },
		{ id: 'lastName', title: 'lastname' },
		{ id: 'email', title: 'email' },
		{ id: 'isMale', title: 'isMale' },
		{ id: 'employmentStatus', title: 'employment_status' },
		{ id: 'department', title: 'department' },
		{ id: 'jobTitle', title: 'job_title' },
		{ id: 'photo', title: 'photo' },
		{ id: 'fingerprintId', title: 'fingerprint_id' },
		{ id: 'terminated', title: 'terminated' },
		{ id: 'latestLog', title: 'latestLog' }
	]

});

exports.toCsv = (data) => {
	if (fs.existsSync(pathCsv + '\\generated.csv')) {
		childProc.execSync('del /f generated.csv', {
			cwd: pathCsv
		})
		csvWriter.writeRecords(data)
			.then(() => console.log('The CSV file was written successfully'))
			.catch(err => console.error(err));
	} else {
		csvWriter.writeRecords(data)
			.then(() => console.log('The CSV file was written successfully'))
			.catch(err => console.error(err));
	}
}
