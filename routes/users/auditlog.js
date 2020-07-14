const router = require('express').Router();

// models
const { AuditLog } = require('../../db/models/AuditLog');

// utilities
const { VerifyCredentials } = require('../../utility/middlewares');
const VerifySession = require('../../utility/middlewares/VerifySession');
const VerifyAdminRights = require('../../utility/middlewares/VerifyAdminRights');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');

router.get('/auditlogs',
	[
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			const auditlogs = await AuditLog.find({}).populate('user');

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully fetched all system logs",
				auditlogs
			});

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("[Register Error] Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("[Register Error] Invalid Access Token.".red)
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