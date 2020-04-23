const jwt = require('jsonwebtoken');

// import model
const { RefreshToken } = require("../db/models/RefreshToken");

exports.createToken = (payload , duration) => {
	return jwt.sign(payload , process.env.JWT_KEY, {
		expiresIn: duration
	});
}



exports.createRefreshToken = async (payload) => {
	
	try {
		const refToken = jwt.sign(payload , process.env.REFRESH_KEY, {
			expiresIn: process.env.REFRESH_TOKEN_DURATION
		});

		// If token already exists, delete token to avoid duplicate
		let tokenExists = await RefreshToken.findOneAndDelete({ email: payload.email });

		// confirm is refresh token is deleted
		if (tokenExists) {
			console.log('Deleted Refresh token');
		}

		// create a new refresh token
		let db_refreshToken = new RefreshToken({
			email: payload.email,
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
