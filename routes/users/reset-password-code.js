const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { confirmSecurityCode } = require('../../utility/handlers/PasswordReset');

// middlewares
const VerifyCodeRules = [
	body('reset_token').trim().escape(),
	body('security_code').trim().escape()
]

function CustomValidator(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.statusCode = 400;
		return res.send({
			errors: "Invalid Request. Invalid Credentials."
		});
	}

	const { reset_token, security_code } = req.body;
	if (!reset_token || !security_code) {
		res.statusCode = 400;
		return res.send({
			errors: "Invalid Request. Incomplete Credentials."
		});
	}

	next();
}

/* ------------------------------------------------------------------------------------------
Route:
/api/users/password_reset/verify

Body:
- reset_token
- security_code

Description:
- 	This api is used for requesting a password reset for a specific account which provides
	a security code to securely update a user's password.

Middlewares:

Author/s:
- Nathaniel Saludes
------------------------------------------------------------------------------------------ */
router.post('/password_reset/verify',
	[
		...VerifyCodeRules,
		CustomValidator
	],
	async (req, res) => {
		try {
			const {
				reset_token,
				security_code
			} = req.body;

			// [1] verify security code
			const access_token = await confirmSecurityCode(reset_token, security_code);

			// [2] if no access token is recieved, security code is invalid.
			if (!access_token) {
				res.statusCode = 401;
				return res.send({
					errors: "Invalid Security Code."
				});
			}

			// [3] else, security code is verified successfully.
			res.statusCode = 200;
			return res.send({
				message: "Security code verified.",
				access_token
			});

		} catch (error) {

			switch (error.name) {
				case "InvalidResetTokenError":
					res.statusCode = 401;
					return res.send({
						errors: "Invalid Reset Token."
					});

				default:
					console.log(`[${error.name}] ${error.message}`.red);
					res.statusCode = 500;
					return res.send({
						errors: error.message
					});
			}

		}
	}
);

module.exports = router;