const faker = require('faker');
const { createDBConnection } = require('../db/index.js');
require('dotenv').config();

// import models
const { Employee } = require('../db/models/Employee');
const { EmployeeLog } = require('../db/models/EmployeeLog');

// createDBConnection(process.env.DB_NAME, process.env.DB_PORT);



function randomGender() {
   let gender;

   let num = Math.floor(Math.random() * 2);
   if(num == 1){
      gender = false; //female
   }
   else {
      gender = true; //male
   }
   return gender;
}

//let randomName = faker.name.findName();






// Employee Log
let randomDateIn = faker.date.future();
let emotionIn = Math.floor(Math.random() * 6);  //0 - 5

let randomDateOut = faker.date.future();
let emotionOut = Math.floor(Math.random() * 6);

let dateCreated = faker.date.future();

// console.log(`
//    Log Created: ${dateCreated}
//    \nName: ${randomName}
//    \nEmployee ID: ${randomID}
//    \nDateIn: ${randomDateIn}
//    \nEmotionIn: ${emotionIn}
//    \nDateOut: ${randomDateOut}
//    \nEmotionOut: ${emotionOut}
//    `);


// DONE
function createEmployee(id, fname, rlname, email, gender, status, department, jobTitle, photoPath, fid) {

         let createStatus = true;

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
			console.log("Here");

			new_employee.save((err) => {
				if (err) {
					console.log(
						"Error or Duplicate Record. Unable to register new employee."
					);
					console.error(err);
					createStatus = false;
				} else {
					console.log("Record Saved");
				}
			});

			console.log("Here2");

			return createStatus;
}

// TODO Continue working on generating employeeLog dummy data
// function createEmployeeLog(idNum, randomDateIn, emotionIn, randomDateOut, emotionIn) {

//    let isSuccess = false;

//    try {
//       let employee = await Employee.findOne({ fingerprintId: idNum });

//       // if employee does not exist, return an error
//       if (!employee) {
//           console.log("No record in Employees");
//       }

//       else{
//          console.log('Employee found')
//       }

//       // if employee doesn't have any latest log
//       if (!employee.latestLog) {

//           let employeeLog = new EmployeeLog({
//               employee: employee._id,
//               employeeId: employee.employeeId
//           });

//           // update employee's latest log
//           employee.latestLog = {
//               reference: employeeLog._id,
//               date: dateNow
//           }

//           await employee.save();

//           console.log('employeeLog', {
//               reference: employeeLog._id,
//               employee: employee.firstName,
//               status: 'in',
//               message: `${employee.firstName} ${employee.lastName} checked in at ${dateNow.toLocaleDateString()}.`
//           });

//       }

//       else { // get the employee's latestLog
//           let employeeLatestLog = await EmployeeLog.findById(employee.latestLog.reference);

//           // if employee's latestLog is not found (deleted) create a new one
//           if (!employeeLatestLog) {

//               let employeeLog = new EmployeeLog({
//                   employee: employee._id,
//                   employeeId: employee.employeeId,
//               });

//               employee.latestLog = {
//                   reference: employeeLog._id,
//                   date: dateNow
//               }

//               await employee.save();

//               console.log('employeeLog', {
//                   reference: employeeLog._id,
//                   employee: employee.firstName,
//                   status: 'in',
//                   message: `Log not found (deleted) \n${employee.firstName} ${employee.lastName} checked in at ${dateNow.toLocaleDateString()}.`
//               });

//           }
//       }

//       return isSucess;

//   } catch (error) {
//       console.error(`Server Error: \n${error.message}`);
//   }
// } // endfunction

// ---------------------------------------------------------------

// GENERATE DATA HERE


//let num = 0;

async function start(){

   try{
      await createDBConnection(process.env.DB_NAME, process.env.DB_PORT);

      let employees = 10; // number of employee and logs
      console.log(`Number of entries: ${employees}\n`);

      for (i = 1; i <= employees; ++i){

         // Create Employee
         let randomID = faker.random.uuid();
         let randomFname = faker.name.firstName();
         let randomLname = faker.name.lastName();
         let randomEmail = faker.internet.email();
         let gender = randomGender();
         let status = Math.floor(Math.random() * 2);
         let department = faker.commerce.department();
         let jobTitle = faker.name.jobTitle();
         let photoURL = faker.image.imageUrl();
         let fingerprintID = i;
         //let fid       = i;

         let employee_message = 'Success';
         //let log_message = 'Success';

         let inputEmployee = createEmployee(randomID, randomFname,    randomLname, randomEmail, gender, status, department, jobTitle, photoURL, fingerprintID);

         let name = `${randomFname} ${randomLname}`;

         if(inputEmployee == false){
            employee_message = 'Failed';
         }

         console.log(`Employee:  ${name} = ${i}`);
         console.log(`Status: ${employee_message}\n`);
      }
   }  catch(err){
      console.log(err);
   }

}

start();
console.log('DONE');