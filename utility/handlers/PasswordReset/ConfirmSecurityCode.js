const jwt = require('jsonwebtoken');
const { decrypt } = require('../Encryption');
const { User } = require('../../../db/models/User');

async function confirmSecurityCode(encrypted_token, security_code) {

	const decrypted_token = decrypt(encrypted_token);
	const decrypted_key = decrypt(security_code);

	try {
		const decoded = jwt.verify(decrypted_token, process.env.JWT_KEY);

		const user = await User.findOne({ email: decoded.email });
		if (!user) {
			const UserNotFoundError = new Error('User does not exist.');
			UserNotFoundError.name = "UserNotFound";
			throw UserNotFoundError;
		}

		if (
			security_code &&
			decrypted_key === decrypted_token.substring(decrypted_token.length - 7)
		) {

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
			InvalidResetToken.name = "InvalidResetToken"
			throw InvalidResetToken;
		}

		throw error;
	}
}

module.exports = confirmSecurityCode;