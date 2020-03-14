const express = require('express')
const router = express.Router();
const path = require('path');

// import utility
const { encrypt, decrypt } = require('../utility/aes');

// import models
const { Employee } = require('../db/models/Employee');


module.exports = (io) => {

   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /api/employees/

	Description:
	?

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', async (req, res) => {
		try {
			// get all employees
			let employees = await Employee.find({});
			return res.status(200).send(employees);

		} catch (error) {
			console.error(error);
			return res.status(500).send('Server error. A problem occured when retrieving employees');
		}		
	});


   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/employees/enroll

	Description:
	?

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll', (req, res) => {
		let employee = req.body;
		console.log(employee);

		// TODO: separate encrypt to another statement.
		const new_employee = new Employee({
			employeeId      : encrypt(employee.employee_id),
			firstName       : encrypt(employee.firstname),
			lastName        : encrypt(employee.lastname),
			email           : encrypt(employee.email),
			isMale          : employee.isMale,
			employmentStatus: employee.employment_status,
			department      : employee.department,
			jobTitle        : employee.job_title,
			fingerprintId   : encrypt(employee.fingerprint_id),
		});

		// TODO: convert this using async/await syntax
		new_employee.save((err) => {
			if (err) {
				return res.sendStatus(500).send('Server error. Unable to register new employee.');
			}

			Employee.find({}).then(employees => {
				decEmp = decrypt(employees);
				io.sockets.emit('newEmployee', decEmp);
				return res.sendStatus(201);
			}).catch(err => {
				console.log(err)
				return res.sendStatus(500).send('Server error. Unable to fetch employees');
			})
		})
	});


	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/employees/upload

	Description:
	This route is used when the HR uploads a CSV file for adding multiple employees

	Assignee:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll/csv', (req, res) => {
		// TODO: @MichaelOng, perform the CSV read file here. tip: install and use the express-fileupload library.
	});


   /*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/employees/:id

	Description:
	?

	Author:
	Nathaniel Saludes
	----------------------------------------------------------------------------------------------------------------------*/
	router.delete('/:id', (req, res) => {
		try {
			let id = req.params.id;

			Employee.findByIdAndUpdate(
				id,
				{ $set: { terminated: true } },
				{ new: true }
			);

			res.status(200);

		} catch (error) {
			res.status(500).send('Server error. Unable to delete employee.');
		}
	});

	return router;
}