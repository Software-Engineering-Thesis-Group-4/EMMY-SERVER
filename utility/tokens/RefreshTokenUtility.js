const jwt = require('jsonwebtoken');
const { RefreshToken } = require('../../db/models/RefreshToken');

const secretKey = process.env.REFRESH_KEY;
const tokenDuration = process.env.REFRESH_TOKEN_DURATION;


/* --------------------------------------------------------------------------------------------
Description:
-	This is a utility for creating refresh token easily by providing user email as payload
	with a set token duration based on the configuration variables (default: 24 hours).

Parameters:
- email
-------------------------------------------------------------------------------------------- */
async function createRefreshToken(email) {
	try {
		// [1] check if refresh token already exists for the specific user
		const existingToken = await RefreshToken.findOne({ email });

		// [2] if the user has no existing refresh token, proceed to create a new one
		if (!existingToken) {

			// sign a new token with email as a payload
			const refresh_token = jwt.sign({ email }, secretKey, {
				expiresIn: tokenDuration
			});

			// store in database as a new user session log
			const db_refresh_token = new RefreshToken({
				email: email,
				token: refresh_token
			});

			await db_refresh_token.save();

			console.log(`Successfully created a new session for (${email})`.green);

			return true;
		}

		// [3] else, if there is currently an existing refresh token, return false
		return false;

	} catch (error) {
		throw new Error("Unable to create a new refresh token.");
	}
}



/* --------------------------------------------------------------------------------------------
Description:
-	This is a utility for deleting refresh tokens using the email provided.

Parameters:
- email
-------------------------------------------------------------------------------------------- */
async function removeRefreshToken(email) {
	const refresh_token = await RefreshToken.findOne({ email });

	if (refresh_token) {
		await refresh_token.remove();
		console.log(`Successfully removed user session (${email}).`.yellow);
		return true;
	}

	return false;
}



/* --------------------------------------------------------------------------------------------
Description:
-	This is a utility for verifying the validity of a refresh token, checking whether it is
	expired or other errors. if expired, it deleted the refresh token.

Parameters:
- email
-------------------------------------------------------------------------------------------- */
async function verifyRefreshToken(email) {
	const refresh_token = await RefreshToken.findOne({ email });

	if (!refresh_token) {
		const SessionNotFoundError = new Error('Session does not exist.');
		SessionNotFoundError.name = "SessionNotFoundError";
		throw SessionNotFoundError;
	}

	try {
		jwt.verify(refresh_token.token, secretKey);
		return true;
	}
	catch (error) {
		if (error.name === 'TokenExpiredError') {
			console.log('User Session Expired.'.red);

			await refresh_token.remove();

			const SessionExpiredError = new Error('Session expired.');
			SessionExpiredError.name = "SessionExpiredError";
			throw SessionExpiredError;
		}

		const InvalidTokenError = new Error('Invalid refresh token.');
		InvalidTokenError.name = "InvalidRefreshTokenError";
		throw InvalidTokenError;
	}
}

module.exports = {
	createRefreshToken,
	removeRefreshToken,
	verifyRefreshToken
}