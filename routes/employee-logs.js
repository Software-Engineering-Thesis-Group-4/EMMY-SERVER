const express = require('express');
const router = express.Router();

// import Employee and EmployeeLog
const { Employee } = require('../db/models/Employee');
const { EmployeeLog } = require('../db/models/EmployeeLog');

module.exports = (io) => {
     /*----------------------------------------------------------------------------------------------------------------------
     -> GET /api/employeeslogs
     
     Description: 
     Get all employeeslogs 
     ----------------------------------------------------------------------------------------------------------------------*/
     router.get('/', (req, res) => {
          EmployeeLog
               .find({})
               .populate('employee')
               .exec((err, logs) => {
                    if (err) return res.status(500).send('Server error. could not retrieve employee logs.');
                    io.sockets.emit('LOAD_ALL_LOGS', logs);
                    return res.status(200).send(logs);
               })
     });





     /*----------------------------------------------------------------------------------------------------------------------
     -> POST /api/employeeslogs
     
     Description: 
     Fingerprint scanner endpoint 
     ----------------------------------------------------------------------------------------------------------------------*/
     router.post('/sedfewefwef', (req, res) => {
          const { enrollNumber } = req.body;
          const now = new Date();

          Employee.findOne({ fingerprintId: enrollNumber }, (err, employee) => {
               if (err) return res.status(500).send('Server error. Unable to retrieve employee');
               if (!employee) return res.status(404).send("Employee not found.");

               // if the employee's latest log doesn't exist do this...
               if (!employee.latestLog) {

                    /*
                       - create a new Employee Log and save it;
                       - then set it as the "latest log" of an employee.
                    */
                    let newLog = new EmployeeLog({
                         in: now,
                         out: null,
                         date: now,
                         employee: employee._id,
                         employeeId: employee.employeeId
                    });

                    newLog.save((err) => {
                         if (err) return res.status(500).send('Server error. Unable to record new log.')

                         Employee.findByIdAndUpdate(employee._id, {
                              $set: {
                                   latestLog: {
                                        reference: newLog._id,
                                        date: now
                                   }
                              }
                         }, (err) => {
                              if (err) return res.status(500).send(`Server error. Unable to update employee[${employee.firstName}] latest log`);
                              io.sockets.emit('employeeLog', { reference: newLog._id, employee: `${employee.firstName}`, status: "in" });
                              return res.status(200).send(`${employee.firstName} ${employee.lastName} clocked-in!`);
                         });

                    });

               } else {
                    /* 
                       - else... if the employee has an existing employee log, check if it exists in the log records;
                       - if the employee is already checked out, check whether it's still the same day. if yes, consider as duplication of logs;
                       - if the employee has not checked-out yet, check whether the date today is past the check-in date. if yes, the employee have forgotted to check-out;
                       - else, check out employee!
                    */
                    const latestLogDate = employee.latestLog.date;
                    EmployeeLog.findById(employee.latestLog.reference, (err, doc) => {

                         if (!doc) {
                              Employee.findByIdAndUpdate(employee._id, {
                                   $set: {
                                        latestLog: null
                                   }
                              }, (err) => {
                                   if (err) return res.status(500).send(`Unable to unset latestLog of ${employee.firstName} ${employee.lastName}`);
                              });

                              return res.status(200).send(`Log not found.`);
                         }

                         if (doc.out) {
                              if (latestLogDate.getUTCDate() >= now.getUTCDate()) {
                                   return res.status(200).send('Cannot have multiple logs on a single day.');

                              } else {

                                   let newLog = new EmployeeLog({
                                        in: now,
                                        out: null,
                                        date: now,
                                        employee: employee._id,
                                        employeeId: employee.employeeId
                                   });

                                   newLog.save((err) => {
                                        if (err) return res.status(500).send('Unable to save new log record.')

                                        Employee.findByIdAndUpdate(employee._id, {
                                             $set: {
                                                  latestLog: {
                                                       reference: newLog._id,
                                                       date: now
                                                  }
                                             }
                                        }, (err) => {
                                             if (err) return res.status(500).send(`Unable to update latest log employee: ${employee.firstName}`);
                                             io.sockets.emit('employeeLog', { reference: newLog._id, employee: `${employee.firstName}`, status: "in" });
                                             return res.status(200).send(`${employee.firstName} ${employee.lastName} clocked-in!`);
                                        });
                                   });
                              }


                         } else {
                              if (latestLogDate.getUTCDate() < now.getUTCDate()) {
                                   Employee.findByIdAndUpdate(employee.id, {
                                        $set: {
                                             latestLog: null
                                        }
                                   }, (err) => {
                                        if (err) return res.status(500).send('Server error. There was a problem updating employee record.');
                                        return res.status(200).send(`${employee.firstName} ${employee.lastName} did not clock-out on: ${latestLogDate}`);
                                   })
                              } else {
                                   EmployeeLog.findByIdAndUpdate(employee.latestLog.reference, {
                                        $set: {
                                             out: now
                                        }
                                   }, (err) => {
                                        if (err) return res.status(500).send('Server error. Unable to update register clock-out.');
                                        io.sockets.emit('employeeLog', { reference: employee.latestLog.reference, employee: `${employee.firstName}`, status: "out" });
                                        return res.status(200).send(`${employee.firstName} ${employee.lastName} clocked out!`);
                                   });
                              }

                         }
                    });

               } // !employee.latestLog ----- end

          });
     });


     router.post('/', (req, res) => {
          const fingerprintNumber = req.body.enrollNumber;
          const dateNow = new Date();

          Employee.findOne({ fingerprintId: fingerprintNumber }, (err, employee) => {
               if (err)
                    return res.sendStatus(500);

               // CHECK IF ANY EMPLOYEE MATCHES THE FINGERPRINT NUMBER
               if (!employee)
                    return res.status(404).send('Employee not found!');

               // CHECK IF EMPLOYEE LATEST LOG IS NULL
               if (!employee.latestLog) {

                    let employeeLog = new EmployeeLog({
                         employee: employee._id,
                         employeeId: employee.employeeId,
                    });

                    employeeLog.save((err, product) => {
                         if (err)
                              return res.status(500).send('Server error. Unable to save employee log.');

                         employee.latestLog = {
                              reference: product._id,
                              date: dateNow
                         }

                         employee.save((err) => {
                              if (err)
                                   return res.status(500).send('Server error. Unable to update employee.');
                              else {
                                   io.sockets.emit('employeeLog', {
                                        reference: employeeLog._id,
                                        employee: employee.firstName,
                                        status: "in"
                                   });

                                   return res.status(200).send({
                                        message: `${employee.firstName} ${employee.lastName} checked-in`
                                   });

                              }
                         });
                    });

               } else {
                    EmployeeLog.findById(employee.latestLog.reference, (err, employeeLog) => {
                         if (err) return res.status(500).send(`Server Error. \n${err}`);

                         // IF EMPLOYEE LOG DOES NOT EXIST, CREATE A NEW LOG AND SET IT AS THE LATEST LOG.
                         // SEND A MESSAGE OF ATTENDANCE LOG NOT FOUND
                         if (!employeeLog) {

                              let newEmployeeLog = new EmployeeLog({
                                   employee: employee._id,
                                   employeeId: employee.employeeId,
                              });

                              newEmployeeLog.save((err, product) => {
                                   if (err) return res.status(500).send(`Server Error. \n${err}`);

                                   employee.latestLog = {
                                        reference: product._id,
                                        date: dateNow
                                   }

                                   employee.save((err) => {
                                        if (err)
                                             return res.status(500).send(`Server Error. \n${err}`);
                                        else {
                                             io.sockets.emit('employeeLog', {
                                                  reference: newEmployeeLog._id,
                                                  employee: employee.firstName,
                                                  status: "in"
                                             });

                                             return res.status(200).send({
                                                  warning: 'Employee Attendance Log does not exist.',
                                                  message: `${employee.firstName} ${employee.lastName} checked-in ${dateNow.toLocaleDateString()}.`
                                             });
                                        }
                                   })
                              });

                         } else {
                              // CHECK IF EMPLOYEE IS ALREADY CHECKED-IN, IF YES PROCEED TO CHECK-OUT
                              if (employeeLog.in) {
                                   // IF CHECK-IN TIME IS PAST 24 HOURS, PROCEED TO CREATE NEW ATTENDANCE LOG
                                   if (employeeLog.in.getUTCDate() < dateNow.getUTCDate()) {

                                        let newEmployeeLog = new EmployeeLog({
                                             employee: employee._id,
                                             employeeId: employee.employeeId,
                                        });

                                        newEmployeeLog.save((err, product) => {
                                             if (err) return res.status(500).send(`Server Error. \n${err}`);

                                             employee.latestLog = {
                                                  reference: product._id,
                                                  date: dateNow
                                             }

                                             employee.save((err) => {
                                                  if (err)
                                                       return res.status(500).send(`Server Error. \n${err}`);
                                                  else {
                                                       io.sockets.emit('employeeLog', {
                                                            reference: newEmployeeLog._id,
                                                            employee: employee.firstName,
                                                            status: "in"
                                                       });

                                                       return res.status(200).send({
                                                            warning: `Employee did not check-out yesterday ${employee.latestLog.date.toLocaleDateString()}.`,
                                                            message: `${employee.firstName} ${employee.lastName} checked-in`
                                                       });
                                                  }
                                             });
                                        });
                                   }

                                   // IF TIME-OUT DOES NOT EXIST, CHECK-OUT EMPLOYEE
                                   if (!employeeLog.out) {
                                        employeeLog.out = dateNow;

                                        employeeLog.save((err, product) => {
                                             if (err) return res.status(500).send(`Server Error. \n${err}`);

                                             employee.latestLog = {
                                                  reference: product._id,
                                                  date: dateNow
                                             }

                                             employee.save(err => {
                                                  if (err)
                                                       return res.status(500).send(`Server Error. \n${err}`);
                                                  else {
                                                       io.sockets.emit('employeeLog', {
                                                            reference: employeeLog._id,
                                                            employee: employee.firstName,
                                                            status: "out"
                                                       });

                                                       return res.status(200).send({
                                                            message: `${employee.firstName} ${employee.lastName} checked-out at ${dateNow.toLocaleTimeString()}`
                                                       });
                                                  }
                                             })
                                        });

                                   } else {
                                        // IF TIME-OUT EXISTS, SEND INVALID ATTENDANCE LOG STATUS (MULTIPLE LOG VIOLATION)
                                        return res.status(400).send(`Multiple attendance log violation.`);
                                   }

                              }
                         }
                    });
               }
          });
     });


     /*----------------------------------------------------------------------------------------------------------------------
     -> POST /api/employeeslogs/update_emotion
     
     Description: 
     endpoint for getting the employee emotion input and update the employee log
     ----------------------------------------------------------------------------------------------------------------------*/
     router.patch('/update_emotion', (req, res) => {
          const { emotion, logReference, status } = req.body;
          console.log(`Log Reference: ${logReference}`);

          EmployeeLog.findById(logReference, (err, document) => {
               if (err) {
                    console.log(err);
                    return res.sendStatus(500);
               }

               if (status === "in") {
                    document.emotionIn = emotion;
                    document.save((err) => {
                         if (err) {
                              console.log(err);
                              return res.sendStatus(500);
                         }

                         return res.sendStatus(200);
                    });
               } else if (status === "out") {
                    document.emotionOut = emotion;
                    document.save((err) => {
                         if (err) {
                              console.log(err);
                              return res.sendStatus(500);
                         }

                         return res.sendStatus(200);
                    });
               }
          })
     });

     return router;
}