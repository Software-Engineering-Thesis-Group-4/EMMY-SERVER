const router = require('express').Router();

// utilities
const { LogoutRules } = require('../../utility/validators/authentication');
const { validationResult } = require('express-validator');
const { removeRefreshToken } = require('../../utility/tokens/RefreshTokenUtility');
const { VerifySession } = require('../../utility/middlewares');

// middleware
const ValidateFields = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.sendStatus(422);
	}

	next();
}


/* --------------------------------------------------------------------------------------------------
Route:
/api/auth/logout

Query Parameters:
- email

Description:
- This API is used for terminating user sessions, thereby unauthenticating them from the system

Middlewares:
# ValidateSession 
	-	ensures that the agent requesting for API has a valid session

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.get('/logout',
	[
		...LogoutRules,
		ValidateFields,
		VerifySession
	],
	async (req, res) => {
		try {
			const email = req.query.user;

			const removedSession = await removeRefreshToken(email);
			if (!removedSession) {
				console.log("Failed to logout user.".red);

				res.statusCode = 500;
				res.send({
					errors: "Internal Server Error. Failed to logout user."
				});
			}

			/* TODO:	Create audit log for the successful logout of the specific user																		*/

			res.statusCode = 200;
			return res.send({
				message: "Successfully logged out user.",
				user: email
			});

		} catch (error) {

			/* TODO:	Create audit log for the logout failure 																										*/

			console.log(`[${error.name}] ${error.message}`);
			res.statusCode = 500;
			return res.send({
				errors: error
			});
		}
	}
);


module.exports = router;