const { validationResult } = require('express-validator');

function ValidateFields(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.statusCode = 400;
		return res.send({
			errors: errors.mapped()
		});
	}

	next();
}

module.exports = ValidateFields;