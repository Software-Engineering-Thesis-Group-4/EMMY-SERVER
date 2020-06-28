const jwt = require('jsonwebtoken');
const { decrypt } = require('../Encryption');
const { User } = require('../../../db/models/User');


/* ------------------------------------------------------------------------
Throws:
- InvalidResetTokenError
------------------------------------------------------------------------ */
async function confirmSecurityCode(encrypted_token, security_code) {

	// [1] check if the security code exists and has a length of 14 characters
	if (security_code && security_code.length !== 14) {
		return null;
	}

	// [2] decrypt token and security code
	const decrypted_token = decrypt(encrypted_token);
	const decrypted_key = decrypt(security_code);

	try {

		// [3] verify the decrypted token
		const decoded = jwt.verify(decrypted_token, process.env.JWT_KEY);

		// [4] find user using the payload email from the decoded token & check if the user exists
		const user = await User.findOne({ email: decoded.email });
		if (!user) {
			const UserNotFoundError = new Error('User does not exist.');
			UserNotFoundError.name = "UserNotFoundError";
			throw UserNotFoundError;
		}

		// [5] if the user exists, check if the decrypted security code matches the last 7 character of the decrypted token
		// if true, return a new signed access token
		if (decrypted_key === decrypted_token.substring(decrypted_token.length - 7)) {

			const token = jwt.sign({ email: user.email }, process.env.JWT_KEY, {
				expiresIn: process.env.TOKEN_DURATION
			});

			return token;
		}

		return null;

	} catch (error) {
		
		if (
			error.name === "TokenExpiredError" ||
			error.name === "JsonWebTokenError" ||
			error.name === "UserNotFound"
		) {
			const InvalidResetToken = new Error('Invalid Reset Token');
			InvalidResetToken.name = "InvalidResetTokenError"
			throw InvalidResetToken;
		}

		throw error;
	}
}

module.exports = confirmSecurityCode;