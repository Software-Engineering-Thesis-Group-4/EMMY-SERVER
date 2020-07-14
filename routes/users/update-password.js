const router = require('express').Router();
const bcrypt = require('bcryptjs');

// models
const { User } = require('../../db/models/User');

// utilities
const { ValidateFields, VerifyCredentials, VerifySession, VerifyAdminRights } = require('../../utility/middlewares');
const { UpdatePasswordRules } = require('../../utility/validators/users');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const createAuditLog = require('../../utility/handlers/AuditLogs/CreateAuditLog');

router.patch('/password',
	[
		...UpdatePasswordRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			const user = await User.findOne({ email: req.query.user });
			if (!user) {
				res.statusCode = 400;
				return res.send({
					errors: "User not found."
				})
			}

			const hashed_password = bcrypt.hashSync(req.body.password);
			await user.updateOne({ password: hashed_password });

			await createAuditLog(
				user.email,
				'UPDATE',
				`${user.firstname} ${user.lastname} updated their account password.`,
				false
			);

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successufully updated password."
			});

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("[Upload Error] Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("[Upload Error] Invalid Access Token.".red)
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