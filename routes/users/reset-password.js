const router = require('express').Router();
const { query, validationResult } = require('express-validator');

// utilities
const { generateSecurityCode } = require('../../utility/handlers/PasswordReset');

// middlewares
const ResetPasswordRules = [
	query('user').trim().escape()
]

function CustomValidator(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.statusCode = 400;
		return res.send({
			errors: "Invalid Request. Invalid Credentials."
		});
	}

	if (!req.query.user) {
		res.statusCode = 400;
		return res.send({
			errors: "Invalid Request. Incomplete Credentials."
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
router.get('/password_reset',
	[
		...ResetPasswordRules,
		CustomValidator,
	],
	async (req, res) => {
		try {
			const email = req.query.user;
			const reset_token = await generateSecurityCode(email);

			res.statusCode = 200;
			return res.send({
				message: "Successfully sent security code to email.",
				reset_token
			});

		} catch (error) {
			switch (error.name) {
				case "UserNotFound":
					res.statusCode = 404;
					return res.send({
						errors: error.message
					});

				default:
					console.log(`[${error.name}] ${error.message}`.red);
					res.statusCode = 500;
					return res.send({
						errors: error
					});
			}

		}
	}
);

module.exports = router;