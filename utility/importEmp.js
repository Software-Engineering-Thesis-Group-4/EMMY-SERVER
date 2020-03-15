const csv   = require('csv-parser');
const fs    = require('fs');
const path  = require('path');

// path to csv file ---- static public files
const pathCsv = path.join(__dirname,'/../public');

// import utility 
const { encrypt, decrypter} = require('./aes')

// import model
const { Employee }  = require('../db/models/Employee');


const csvImport = (csvFile) => {
  
  fs.createReadStream(csvFile)
    .pipe(csv({
    strict     : true
  }))
  .on('data', (data) => {
    
    const empId         = encrypt(data.employee_id);
    const firstName     = encrypt(data.firstname);
    const lastName      = encrypt(data.lastname);
    const email         = encrypt(data.email);
    const fingerprintId = encrypt(parseInt(data.fingerprint_id))
  
    const newEmp = new Employee({
      employeeId      : empId,
      firstName       : firstName,
      lastName        : lastName,
      email           : email,
      isMale          : data.isMale,
      employmentStatus: parseInt(data.employment_status),
      department      : data.department,
      jobTitle        : data.job_title,
      photo           : data.photo,
      fingerprintId   : fingerprintId,
      terminated      : data.terminated
   });

    newEmp.save()
      .then((emp) => {
        console.log(`Added employee ${decrypter(emp.firstName)}`);
      })
      .catch(err => console.error(err));
    
  })
  .on('end', () => {
    console.log('Succesfully imported csv file')  
  });
}

module.exports = {
    csvImport
}