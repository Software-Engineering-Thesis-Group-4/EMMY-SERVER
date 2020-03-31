const faker = require('faker');
const { createDBConnection, closeDBConnection  } = require('../db/index.js');
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

function randomDepartment() {

   let department = ['Human Resources', 'Faculty', 'Finance'];

   let random = Math.floor(Math.random() * department.length);
   let selected = department[random];

   return selected;
}

// TODO update department field to randomly choose a school department via Array[i]
function createEmployee(objectData, iterator) {

   let createStatus = true;

   const new_employee = new Employee({
      employeeId: objectData.randomID,
      firstName: objectData.randomFname,
      lastName: objectData.randomLname,
      email: objectData.randomEmail,
      isMale: objectData.randomGender,
      employmentStatus: objectData.status,
      department: objectData.department,
      jobTitle: objectData.jobTitle,
      photo: objectData.photoURL,
      fingerprintId: objectData.fingerprintID,
      terminated: false,
      latestLog: null
   });

   new_employee.save((err) => {
      if (err) {
         console.log("Error or Duplicate Record. Unable to register new employee.");
         //console.error(err);
         createStatus = false;
      } else {
         console.log(`Record Saved - Employee: ${iterator}: ${objectData.randomFname}`);
      }
   });
   return createStatus;
}

// TODO Continue working on generating employeeLog dummy data
async function createEmployeeLog(fprintIDNum) {

   let isSuccess = false;

   try {
      let employee = await Employee.findOne({ fingerprintId: fprintIDNum });

      // if employee does not exist, return an error
      if (!employee) {
         return new Error('Employee does not exist');
      }

      console.log('Employee found')

      let clockIn = new EmployeeLog({
         employeeRef: employee._id
      });

      await clockIn.save();

      // clockIn.save((err) => {
      //    if(err){
      //       console.log("Error or Duplicate Record. Unable to register new employee.");
      //       //console.error(err);
      //       //success = false
      //    } else{
      //       console.log(`Clock In Recorded: ${employee.fingerprintId}`);
      //       ++checker;
      //    }
      // });

      employee.latestLog = {
         reference: clockIn._id,
         date: clockIn.in
      }

      await employee.save();

      // employee.save((err) => {
      //    if(err){
      //       console.log("Error or Duplicate Record. Unable to register new employee.");
      //       //console.error(err);
      //       //success = false
      //    } else{
      //       console.log(`Clock In Saved: ${employee.firstName}: ${employee.fingerprintId}`);
      //       ++checker;
      //    }
      // });

      success = true;

      } catch (error) {
         console.error(`Server Error: \n${error.message}`);
      }
   }

   async function start(){

      try{
         await createDBConnection(process.env.DB_NAME, process.env.DB_PORT);

         let employees = 10; // number of employee and logs
         console.log(`Number of entries: ${employees}\n`);

         for (let iterator = 1; iterator <= employees; ++iterator){

            // Bind generated data to the object
            let fakeData = {
               randomID      : faker.random.uuid(),
               randomFname   : faker.name.firstName(),
               randomLname   : faker.name.lastName(),
               randomEmail   : faker.internet.email(),
               gender        : randomGender(),
               status        : Math.floor(Math.random() * 2),   // random part time or full time
               department    : randomDepartment(),
               jobTitle      : faker.name.jobTitle(),
               photoURL      : faker.image.imageUrl(),
               fingerprintID : iterator,
               terminated    : false,
               latestlog     : null
            }

            let inputEmployee    = createEmployee(fakeData, iterator);
            let employee_message = null;
            let name             = null;

            if(inputEmployee == true){
               employee_message = 'Success';
               name = `${fakeData.randomFname} ${fakeData.randomLname}`;
               console.log(`Employee:  ${name} = ${iterator}`);
               console.log(`Status: ${employee_message}\n`);

               let logStatus = createEmployeeLog(iterator);

               if (logStatus == false){
                  console.log('Created Employee but failed on Employee Logs');
               } else {
                  console.log('Employee and Logs Successfully created');
               }
            }
            else if (inputEmployee == false) {
               employee_message = 'Failed';
               console.log(`Employee: ${iterator}`);
               console.log(`Status: ${employee_message}\n`);
            }
            else {
               console('Some kind of error');
            }
         }

         await closeDBConnection();

      }  catch(err){
         console.log(err);
      }

      console.log('DONE');
   }

   start();
   //The following example deletes all documents from the employees collection:
   // await db.collection('employees').deleteMany({});