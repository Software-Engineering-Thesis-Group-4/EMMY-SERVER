const jwt = require('jsonwebtoken');

// import model
const { RefreshToken } = require("../db/models/RefreshToken");

exports.createToken = (email, duration) => {
	return jwt.sign(email , process.env.JWT_KEY, {
		expiresIn: duration
	});
}


exports.createRefreshToken = async (email) => {

	try {
		const refToken = jwt.sign({ email }, process.env.REFRESH_KEY, {
			expiresIn: process.env.REFRESH_TOKEN_DURATION
		});

		// If token already exists, delete token to avoid duplicate
		let tokenExists = await RefreshToken.findOneAndDelete({ email });

		// confirm is refresh token is deleted
		if (tokenExists) {
			console.log('Deleted Refresh token');
		}

		// create a new refresh token
		let db_refreshToken = new RefreshToken({
			email: email,
			token: refToken
		});

		db_refreshToken.save();
		console.log('Succesfully saved refresh token');

	} catch (error) {
		console.error(error);
		throw new Error(error.message);
	}
}

exports.removeRefreshToken = async (email) => {
	try {
		let deletedRT = await RefreshToken.findOneAndDelete({ email });

		if(deletedRT) {
			console.log('Succesfully removed/deleted refresh token');
		}

	} catch (error) {
		console.log('Failed to removed/delete refresh token');
		throw new Error(error.message)
	}
}
