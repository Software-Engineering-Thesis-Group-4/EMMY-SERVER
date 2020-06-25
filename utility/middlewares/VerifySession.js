// utility
const { verifyRefreshToken } = require("../tokens/RefreshTokenUtility");


/* -------------------------------------------------------------------------------------------------------------------
Description:
This middleware ensures that the agent requesting for API has a valid existing session in the database

Required Fields:
- user (email of user)
------------------------------------------------------------------------------------------------------------------- */
const VerifySession = async (req, res, next) => {
	try {
		const email = req.query.user;

		// [1] If email is not provided, send an error response for "Unauthorized Access"
		if (!email) {
			res.statusCode = 401;
			return res.send({
				errors: "Unauthorized Access. Incomplete Credentials."
			})
		}

		// [2] check if session is still valid (not expired), else remove token and return an error response for "unauthorized access"
		await verifyRefreshToken(email);

		next();

	} catch (error) {
		switch (error.name) {
			case "SessionNotFoundError":
				console.log(`[Session Validation Error] Session Not Found.`.red);
				res.statusCode = 401;
				return res.send({
					errors: "Unauthorized Access. Session Not Found."
				});

			case "SessionExpiredError":
				console.log(`[Session Validation Error] Session Expired.`.red);
				res.statusCode = 401;
				return res.send({
					errors: "Unauthorized Access. Session Expired."
				});

			case "InvalidRefreshTokenError":
				console.log(`[Session Validation Error] Invalid Refresh Token`.red);
				res.statusCode = 401;
				return res.send({
					errors: "Unauthorized Access. Refresh Token Error."
				});

			default:
				res.statusCode = 500;
				return res.send({
					errors: "Internal Server Error. Unable to validate session."
				})
		}
	}
}

module.exports = VerifySession;