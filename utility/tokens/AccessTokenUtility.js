const jwt = require('jsonwebtoken');

// constant variables
const secretKey = process.env.JWT_KEY;
const tokenDuration = process.env.TOKEN_DURATION;


/* --------------------------------------------------------------------------------------------
Description:
-	This is a utility for creating access token easily by just providing a payload object
	with a set token duration based on the configuration variables (default: 1 hour).

Parameters:
- payload (object)
-------------------------------------------------------------------------------------------- */
function createAccessToken(payload) {
	// if payload is undefined, set payload as empty object
	const access_token = jwt.sign(payload || {}, secretKey, {
		expiresIn: tokenDuration
	});

	return access_token;
}



/* --------------------------------------------------------------------------------------------
Description:
-	This is a utility for verifying access tokens and automatically signs a new one if it
	is expired. Throws an error if access token is invalid or missing. returns null if is valid.

Parameters:
- access_token
-------------------------------------------------------------------------------------------- */
function verifyAccessToken(access_token) {
	if (!access_token) {
		const IncompleteCredentialsError = new Error('Access token is undefined');
		IncompleteCredentialsError.name = "IncompleteCredentials";
		throw IncompleteCredentialsError;
	}

	try {
		jwt.verify(access_token, secretKey);
		return null;
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			const access_token = createAccessToken();
			return access_token;
		}

		const InvalidTokenError = new Error('Invalid access token.');
		InvalidTokenError.name = "InvalidAccessToken";
		throw InvalidTokenError;
	}
}


module.exports = {
	createAccessToken,
	verifyAccessToken
}