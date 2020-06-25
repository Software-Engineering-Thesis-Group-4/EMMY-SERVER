const router = require('express').Router();

// utilities
const { AttendanceHandler } = require('../../utility/handlers/AttendanceLog/AttendanceHandler');

// middlewares
const ValidateFields = (req, res, next) => {
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
		ValidateFields
	],
	async (req, res) => {
		try {
			const fingerprint_id = req.params.fingerprint_id;
			const attendance = await AttendanceHandler(parseInt(fingerprint_id));

			res.statusCode = 200;
			return res.send(attendance);

		} catch (error) {
			switch (error.name) {
				case "EmployeeNotFound":
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
					res.statusCode = 422;
					return res.send({
						errors: "Cannot have multiple logs in a day."
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