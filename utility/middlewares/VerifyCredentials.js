function VerifyCredentials(req, res, next) {
	const { user, access_token } = req.query;
	if(!user || !access_token) {
		res.statusCode = 400;
		return res.send({
			errors: "Unauthorized Access. Incomplete Credentials."
		})
	}

	next();
}

module.exports = VerifyCredentials;