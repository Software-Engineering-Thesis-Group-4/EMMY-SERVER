const router = require('express').Router();

// utilities
const { AttendanceHandler } = require('../../utility/handlers/AttendanceLog/AttendanceHandler');

// middlewares
const CustomValidator = (req, res, next) => {
	const { fingerprint_id } = req.params;
	if (!fingerprint_id) {
		res.statusCode = 422;
		return res.send({
			errors: "Fingerprint ID not provided."
		})
	}

	next();
}

/* --------------------------------------------------------------------------------------------------
Route:
/api/employeeslogs/scanner

Query Parameters:
- fingerprint_id

Description:
-	This API is used for handling registering employee attendance when an employee scans their fingerprint
	through the fingerprint scanner

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.get('/scanner/:fingerprint_id',
	[
		CustomValidator
	],
	async (req, res) => {
		try {
			const fingerprint_id = req.params.fingerprint_id;
			const attendance = await AttendanceHandler(parseInt(fingerprint_id));

			if (attendance) {
				const { employee, employee_log, login_mode } = attendance;

				const io = emmy_socketIo;

				io.in('daily_sentiment').emit('SCANNER', {
					id: employee_log._id,
					employee: `${employee.firstname} ${employee.lastname}`,
					login_mode
				});
			}

			res.statusCode = 200;
			return res.send(attendance);

		} catch (error) {
			const io = emmy_socketIo;
			switch (error.name) {
				case "EmployeeNotFound":
					io.in('daily_sentiment').emit('SCANNER_ERROR', {
						message: error.message
					});
					res.statusCode = 404;
					return res.send({
						errors: "Employee does not exist."
					});

				case "InvalidFingerprintId":
					res.statusCode = 422;
					return res.send({
						errors: "Invalid fingerprint number."
					});

				case "MultipleEmployeeLogError":
					io.in('daily_sentiment').emit('SCANNER_ERROR', {
						message: error.message
					});
					res.statusCode = 422;
					return res.send({
						errors: "Cannot have multiple logs in a day."
					});

				case "PartTimeEmployee":
					res.statusCode = 200;
					return res.send({
						message: "Part-time employee."
					});

				default:
					console.log(`[${error.name}] ${error.message}`);
					res.statusCode = 500;
					return res.send({
						errors: error
					});
			}
		}
	}
);

module.exports = router;