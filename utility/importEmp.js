const csv   = require('csv-parser');
const fs    = require('fs');
const path  = require('path');

// path to csv file ---- static public files
const pathCsv = path.join(__dirname,'/../public');

// import utility 
const { encrypt, decrypter} = require('../model/aes')

// import model
const Employee  = require('../model/employee.model');


const csvImport = (csvFile) => {
  
  fs.createReadStream(csvFile)
    .pipe(csv({
    strict : true
  }))
  .on('data', (data) => {

    const newEmp = new Employee({
      employeeId      : encrypt(data.employee_id),
      firstName       : encrypt(data.firstname),
      lastName        : encrypt(data.lastname),
      email           : encrypt(data.email),
      isMale          : data.isMale,
      employmentStatus: data.employment_status,
      department      : data.department,
      jobTitle        : data.job_title,
      fingerprintId   : encrypt(data.fingerprint_id),
   });

    newEmp.save()
      .then((emp) => {
        console.log(`Added employee ${decrypter(emp.firstName)}`);
      })
      .catch(res.sendStatus(500).send('Server error. Unable to register employee.'));
    
  })
  .on('end', () => {
    console.log('Succesfully imported csv file')  
  });
}

module.exports = {
    csvImport
}