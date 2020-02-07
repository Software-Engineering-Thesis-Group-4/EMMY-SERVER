const express = require('express');
const router = express.Router();

// import Employee and EmployeeLog
const { Employee } = require('../db/models/Employee');
const { EmployeeLog } = require('../db/models/EmployeeLog');

module.exports = (io) => {
   /*-----------------------------------------------------------
   -> GET /api/employeeslogs
   
   Description: 
   Get all employeeslogs 
   -----------------------------------------------------------*/
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


   /*-----------------------------------------------------------
   -> POST /api/employeeslogs
   
   Description: 
   Fingerprint scanner endpoint 
   -----------------------------------------------------------*/
   router.post('/', (req, res) => {
      const { enrollNumber, timestamp, attendanceState } = req.body;
      const now = new Date();

      // let attState;
      // switch (attendanceState) {
      //    case 0:
      //       attState = "check-in";
      //       break;
      //    case 1:
      //       attState = "check-out";
      //       break;
      //    case 4:
      //       attState = "overtime-in";
      //       break;
      //    case 5:
      //       attState = "overtime-out";
      //       break;
      // }

      Employee.findOne({ fingerprintId: enrollNumber }, (err, employee) => {
         if (err) return res.status(500).send('Server error. Unable to retrieve employee');
         if (!employee) return res.status(404).send("Employee not found.");

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
                  io.sockets.emit('employeeLog', { employee, status: "in" });
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
                           io.sockets.emit('employeeLog', {employee, status: "in"});
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
                        io.sockets.emit('employeeLog', {employee, status: "out"});
                        return res.status(200).send(`${employee.firstName} ${employee.lastName} clocked out!`);
                     });
                  }

               }
            });

         } // !employee.latestLog ----- end

      });
   });


   /*-----------------------------------------------------------
   -> POST /api/employeeslogs/update_emotion
   
   Description: 
   endpoint for getting the employee emotion input
   -----------------------------------------------------------*/
   router.post('/update_emotion', (req, res) => {
      const { emotion, employeeId, status } = req.body;
      console.log(emotion)
      console.log(employeeId)
      console.log(status)

      if(status == "in") {
         EmployeeLog.findOneAndUpdate({ employeeId }, {
            $set: {
               emotionIn: emotion
            }
         }, err => {
            if(err) return res.send(500);
            else io.sockets.emit('clearEmotions');
            return res.send(200);
         })
      } else {
         EmployeeLog.findOneAndUpdate({ employeeId }, {
            $set: {
               emotionOut: emotion
            }
         }, err => {
            if(err) return res.send(500);
            else io.sockets.emit('clearEmotions');
            return res.send(200);
         })
      }

      // Employee.find({ employeeId }, (err, employee) => {
      //    if (err) return res.send(404);

      //    EmployeeLog
      //       .find({ employee: employee._id })
      //       .populate('employee')
      //       .exec((err, employeeLog) => {
      //          if (err) return res.send(400);

               

      //          if (employeeLog.emotionIn === 0) {
      //             EmployeeLog.findOneAndUpdate({ _id: employeeLog._id }, {
      //                $set: {
      //                   emotionIn: emotion
      //                }
      //             }, (err) => {
      //                if (err) return res.send(500);
      //                else return io.sockets.emit('clearEmotions');
      //             })
      //          } else {
      //             EmployeeLog.findOneAndUpdate({ _id: employeeLog._id }, {
      //                $set: {
      //                   emotionOut: emotion
      //                }
      //             }, (err) => {
      //                if (err) return res.send(500);
      //                else return io.sockets.emit('clearEmotions');
      //             })
      //          }
      //       })

      // });
   })

   return router;
}