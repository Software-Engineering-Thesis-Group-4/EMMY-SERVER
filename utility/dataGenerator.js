const faker = require('faker');
const { createDBConnection, closeDBConnection } = require('../db/index.js');
require('dotenv').config();

// import models
const { Employee } = require('../db/models/Employee');

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


// DONE
async function createEmployee(id, fname, rlname, email, gender, status, department, jobTitle, photoPath, fid) {
   let createStatus = true;
   
   try {

      const new_employee = new Employee({
         employeeId: id,
         firstName: fname,
         lastName: rlname,
         email: email,
         isMale: gender,
         employmentStatus: status,
         department: department,
         jobTitle: jobTitle,
         photo: photoPath,
         fingerprintId: fid,
         terminated: false,
         latestLog: null
      });

      await new_employee.save();
      console.log(`Record Saved: ${ new_employee.firstName }`);

      return createStatus;

   } catch (error) {
      console.error(error);
      createStatus = false;
      return createStatus;
   }   
}

async function start() {

   try {
      await createDBConnection("EMMY_TEST", 27017);

      let employees = 10; // number of employee and logs
      console.log(`Number of entries: ${employees}\n`);

      for (i = 1; i <= employees; ++i) {

         // Create Employee
         let randomID      = faker.random.uuid();
         let randomFname   = faker.name.firstName();
         let randomLname   = faker.name.lastName();
         let randomEmail   = faker.internet.email();
         let gender        = randomGender();
         let status        = Math.floor(Math.random() * 2);
         let department    = faker.commerce.department();
         let jobTitle      = faker.name.jobTitle();
         let photoURL      = faker.image.imageUrl();
         let fingerprintID = i;

         let employee_message = 'Success';

         let CE_status = await createEmployee(randomID, randomFname, randomLname, randomEmail, gender, status, department, jobTitle, photoURL, fingerprintID);

         let name = `${randomFname} ${randomLname}`;

         if (CE_status == false) {
            employee_message = 'Failed';
         }

         console.log(`Employee:  ${name} = ${i}`);
         console.log(`Status: ${employee_message}\n`);
      }

      // Close db connection to prevent continuous process
      await closeDBConnection();
      console.log('DONE');

   } catch (err) {
      console.log(err);
   }

}

start();