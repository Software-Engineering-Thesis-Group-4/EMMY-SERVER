// models
const { RefreshToken } = require("../../db/models/RefreshToken");


/* -------------------------------------------------------------------------------------------------------------------
Description:
This middleware ensures that the agent requesting for the API has no existing session to prevent multiple session
creation

Required Fields:
- email
------------------------------------------------------------------------------------------------------------------- */
const VerifyNonDuplicateSession = async (req, res, next) => {
	try {
		const email = req.body.email;
		const refresh_token = await RefreshToken.findOne({ email });

		// [1] if the current user has an existing session, return an error response
		if (refresh_token) {
			console.log("Failed login attempt. Session already exists.".red);
			res.statusCode = 400;
			return res.send({
				errors: "Failed login attempt. Session already exists."
			})
		}

		// [2] if the user has no existing session, proceed.
		next();

	} catch (error) {
		res.statusCode = 500;
		return res.send({
			errors: "Internal Server Error. Unable to process login request."
		})
	}
}

module.exports = VerifyNonDuplicateSession;