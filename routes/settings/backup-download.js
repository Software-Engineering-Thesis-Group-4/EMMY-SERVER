const router = require('express').Router();
const path = require('path');
const { VerifyAdminRights, VerifyCredentials, VerifySession } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const zipBackup = require('../../utility/handlers/DatabaseBackup/ZipBackup');
const { query } = require('express-validator');

const DownloadBackupRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
]

router.get('/backup/download',
	[
		...DownloadBackupRules,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			verifyAccessToken(req.query.access_token);
			const filename = await zipBackup();

			res.statusCode = 200;
			return res.download(path.join(__dirname, `../../db/zip/${filename}`));

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("Invalid Access Token.".red)
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