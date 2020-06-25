// models
const { User } = require("../../db/models/User");


/* -------------------------------------------------------------------------------------------------------------------
Description:
This middleware ensures that the agent requesting for API has admin previliges

Required Fields:
- user (email of user)
------------------------------------------------------------------------------------------------------------------- */
const VerifyAdminRights = async (req, res, next) => {
	try {
		const email = req.query.user;

		const user = await User.findOne({ email });
		if (!user || !user.isAdmin) {
			res.statusCode = 401;
			return res.send({
				error: "Unauthorized Access. Admin Rights Required."
			})
		}

		next();

	} catch (error) {
		// If there is an error retrieving the user data, return an error response for "internal server error".
		res.statusCode = 500;
		return res.send({
			errors: "Internal Server Error. Unable to validate session."
		})
	}
}

module.exports = VerifyAdminRights;