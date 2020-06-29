const router = require('express').Router();
const { VerifyAdminRights, VerifyCredentials, VerifySession, ValidateFields } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { query, body } = require('express-validator');
const { Department } = require('../../db/models/Departments');

const AddDepartmentRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),

	body('department').trim().escape().exists().notEmpty().isString()
]


// ROUTE: /api/settings/departments
router.post('/departments',
	[
		...AddDepartmentRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			let name = req.body.department;
			name = name.toUpperCase();

			const existing = await Department.findOne({ name });
			if (existing) {
				res.statusCode = 400;
				return res.send({
					errors: "Department already exists."
				});
			}

			const new_department = new Department({
				name: name
			});

			await new_department.save();

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully added new department category.",
				department: new_department.name
			})

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("Invalid Access Token.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Invalid Access Token."
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