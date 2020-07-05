const router = require('express').Router();

const { VerifySessionRules } = require('../../utility/validators/authentication');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession } = require('../../utility/middlewares');

router.get('/verify',
	[
		...VerifySessionRules,
		VerifySession
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully verified session."
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