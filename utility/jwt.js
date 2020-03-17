const jwt = require('jsonwebtoken');

// import model
const { Token } = require("../db/models/Token");


const createToken = (user, duration) => {
	let token = jwt.sign(user, process.env.JWT_KEY, {
		expiresIn: duration
	});

	return token;
}

const createRefreshToken = async (email) => {
	try {
		// find matching refresh token
		let refreshToken = await Token.findOne({ email });

		// delete refresh token if expired...
		if (refreshToken) {
			jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, decoded) => {
				if (err.name === "TokenExpiredError") {
					Token.findByIdAndDelete(refreshToken._id);
				}
			});
		}

		// sign a new refresh token
		let newRefreshToken = jwt.sign(email, process.env.REFRESH_KEY, {
			expiresIn: process.env.REFRESH_TOKEN_DURATION
		});

		// create a new refresh token
		const db_refreshToken = new Token({
			email: email,
			token: newRefreshToken
		});

		// save new refresh token
		db_refreshToken.save();
		console.log('[SUCCESS] saved new refresh token to database.');

	} catch (error) {
		console.error(error);
		console.log('[ERROR] unable to generate refresh token.')
	}
}

module.exports = {
	createToken,
	createRefreshToken
}
