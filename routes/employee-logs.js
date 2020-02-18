const express = require('express');
const router = express.Router();

// import Employee and EmployeeLog
const { Employee } = require('../db/models/Employee');
const { EmployeeLog } = require('../db/models/EmployeeLog');

// import utilities
const CreateEmployeeLog = require('../utilities/create-employee-log');

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
     router.post('/', async (req, res) => {
          try {
               const fingerprintNumber = req.body.enrollNumber;
               let response = await CreateEmployeeLog(io, fingerprintNumber);
               return res.status(response.status).send(response.message);

          } catch ({ status, message }) {
               return res.status(status).send(message);
          }
     })


     /*----------------------------------------------------------------------------------------------------------------------
     -> POST /api/employeeslogs/update_emotion
     
     Description: 
     endpoint for getting the employee emotion input and update the employee log
     ----------------------------------------------------------------------------------------------------------------------*/
     router.post('/update_emotion', async (req, res) => {

          try {
               const { emotion, employeeLog, status } = req.body;
               let log = await EmployeeLog.findById(employeeLog);
               // console.log(log);

               if (!log) {
                    throw new Error('Log not found!');
               } else {
                    switch (status) {
                         case "in":
                              log.emotionIn = emotion;
                              console.log(await log.save());
                              io.sockets.emit('reset');
                              return res.sendStatus(200);

                         case "out":
                              log.emotionOut = emotion;
                              console.log(await log.save());
                              io.sockets.emit('reset');
                              return res.sendStatus(200);
                    }
               }

          } catch (error) {
               res.status(500).send(error.message);
          }
     });

     return router;
}