const express = require('express');
const router = express.Router();

// import Employee and EmployeeLog
const { Employee } = require('../db/models/Employee');
const { EmployeeLog } = require('../db/models/EmployeeLog');

// import utilities
const CreateEmployeeLog = require('../utility/CreateEmployeeLog.js');

// session checker middleware
const isAuthenticated = (req, res, next) => {

	if (req.session.username) {
		console.log('authenticated!');
		return next();
	} else {
		return res.status(401).send(`you are not logged in`);
	}

}

module.exports = (io) => {
     /*----------------------------------------------------------------------------------------------------------------------
     -> GET /api/employeeslogs
     
     Description: 
     Get all employeeslogs 
     ----------------------------------------------------------------------------------------------------------------------*/
     router.get('/', async (req, res) => {
          try {
               let employeeLogs = await EmployeeLog.find({}).populate('employee');
               return res.status(200).send(employeeLogs);

          } catch (error) {
               return res.status(500).send('Server error. could not retrieve employee logs.');
          }

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
     -> POST /api/employeeslogs/sentiment
     
     Description: 
     endpoint for getting the employee emotion input and update the employee log
     ----------------------------------------------------------------------------------------------------------------------*/
     router.patch('/sentiment', async (req, res) => {

          try {
               const { emotion, employeeLog, status } = req.body;
               let log = await EmployeeLog.findById(employeeLog);

               if (!log) {
                    throw new Error('Log not found!');
               } else {
                    switch (status) {
                         case "in":
                              log.emotionIn = emotion;
                              await log.save();
                              return res.sendStatus(200);

                         case "out":
                              log.emotionOut = emotion;
                              await log.save();
                              return res.sendStatus(200);
                    }
               }

          } catch (error) {
               res.status(500).send(error.message);
          }
     });

     return router;
}