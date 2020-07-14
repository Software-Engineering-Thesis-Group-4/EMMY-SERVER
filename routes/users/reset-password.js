const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// models
const { User } = require('../../db/models/User');

// utilities
const { body, validationResult } = require('express-validator');
const createAuditLog = require('../../utility/handlers/AuditLogs/CreateAuditLog');

// middlewares
const UpdatePasswordRules = [
	body('password').exists().notEmpty().isString().isLength({ min: 6 }),
	body('confirm_password').exists().notEmpty().isString().custom(
		(value, { req }) => {
			if (value !== req.body.password)
				throw new Error('Password confirmation failed.');
			return true;
		}
	),
	body('access_token').trim(),
]

function CustomValidator(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.statusCode = 422;
		return res.send({
			errors: errors.mapped()
		});
	}

	const { access_token } = req.body;
	if (!access_token) {
		res.statusCode = 400;
		return res.send({
			errors: "Unauthorized Access. Incomplete Credentials."
		});
	}

	next();
}

/* ------------------------------------------------------------------------------------------
Route:
/api/users/password_reset

Query Parameters:
- email

Description:
- 	This api is used for requesting a password reset for a specific account which provides
	a security code to securely update a user's password.

Middlewares:

Author/s:
- Nathaniel Saludes
------------------------------------------------------------------------------------------ */
router.post('/password_reset',
	[
		...UpdatePasswordRules,
		CustomValidator
	],
	async (req, res) => {
		try {
			const {
				access_token,
				password
			} = req.body;

			const token = jwt.verify(access_token, process.env.JWT_KEY);
			if (!token.email) {
				res.statusCode = 400;
				return res.send({
					errors: "Unauthorized Access. Invalid Token."
				});
			}

			const user = await User.findOne({ email: token.email });
			if (!user) {
				res.statusCode = 400;
				return res.send({
					errors: "Unauthorized Access. Invalid Token."
				});
			}

			const hashed_password = bcrypt.hashSync(password);

			user.password = hashed_password;
			await user.save();

			await createAuditLog(
				user.email,
				'UPDATE',
				`${user.firstname} ${user.lastname} performed a password reset.`,
				false
			);

			res.statusCode = 200;
			return res.send({
				message: 'Successfully changed password.',
				user: user.email
			});

		} catch (error) {
			if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
				res.statusCode = 400;
				return res.send({
					errors: "Unauthorized Access. Invalid Token."
				})
			}

			console.log(`[${error.name}] ${error.message}`.red);
			res.statusCode = 500;
			return res.send({
				errors: error
			})
		}
	}
)

module.exports = router;