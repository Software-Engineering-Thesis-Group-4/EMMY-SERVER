const router = require('express').Router();
const { VerifyAdminRights, VerifyCredentials, VerifySession, ValidateFields } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { query, body } = require('express-validator');
const { addOneDepartment } = require('../../utility/handlers/Departments');
const createAuditLog = require('../../utility/handlers/AuditLogs/CreateAuditLog');

const AddDepartmentRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),

	body('department').trim().escape().exists().notEmpty().isString()
]


// ROUTE: /api/settings/departments
router.patch('/departments',
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

			let new_department = await addOneDepartment(req.body.department);

			await createAuditLog(
				req.query.user,
				'CREATE',
				`${req.query.user} added a new department.`,
				false
			);

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully added new department category.",
				department: new_department
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

				case "DuplicateDepartmentError":
					console.log('Department already exists.'.red);
					res.statusCode = 409;
					return res.send({
						errors: error.message
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