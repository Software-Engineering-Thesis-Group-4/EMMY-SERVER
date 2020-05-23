const jwt = require('jsonwebtoken');
require('colors');


const tokenPicker = (token) => {

	switch(token.toLowerCase()){

		case 'refreshtoken':
			return tokenKey = process.env.REFRESH_KEY;

		case 'authtoken':
			return tokenKey = process.env.JWT_KEY;

		default:
			return null;
	}
}


// import model
const { RefreshToken } = require("../db/models/RefreshToken");

/**
 * @param payload - any object with key-value pair to be stored in the "access token"
 * @returns an access token with an expiration equal to config variable "TOKEN_DURATION" (default = 1h | 1 hour)
 * @description used for creating "access tokens" for the user when requesting a resource access.
 */
exports.createAccessToken = (payload) => {
	const access_token = jwt.sign({ ...payload }, process.env.JWT_KEY, {
		expiresIn: process.env.TOKEN_DURATION
	});

	return access_token;
}


/**
 * @param payload - email of user to be stored in the "reset Token"
 * @returns an reset token with an expiration equal to config variable "RESET_PASS_TOKEN" (default = 1m | 1 minute)
 * @description used for creating "reset tokens" for the user when requesting a reset password email.
 */

exports.createResetPassToken = (payload) => {
	const resetToken = jwt.sign({ email: payload.email }, process.env.JWT_KEY, {
		expiresIn: process.env.RESET_PASS_TOKEN
	});

	return resetToken;
}

/**
 * @param email - is used for referencing refresh tokens of logged in users
 * @returns refresh token with an expiration equal to config variable "REFRESH_TOKEN_DURATION" (default = 24h | 24 hours)
 * @description used for creating "refresh token" for renewing expired access tokens. if expired, users have to reauthenticate
 */
exports.createRefreshToken = async (email) => {
	try {		

		// If token already exists, delete token to avoid duplicate
		let tokenExists = await RefreshToken.findOneAndDelete({ email });

		// confirm if refresh token is deleted
		if (tokenExists) {
			console.log('Already Exists. Deleted existing refresh token.'.yellow);
		}

		// sign new refresh token
		const refToken = jwt.sign({}, process.env.REFRESH_KEY, {
			expiresIn: process.env.REFRESH_TOKEN_DURATION
		});

		// create a new refresh token
		let db_refreshToken = new RefreshToken({
			email: email,
			token: refToken
		});

		await db_refreshToken.save();
		console.log('Succesfully saved new refresh token'.green);

	} catch (error) {
		console.error(error);
		throw new Error(error.message);
	}
}

/**
 * @param email - is used for referencing refresh tokens of logged in users
 * @description used for deleting "refresh tokens" when users logout. (unauthenticating)
 */
exports.removeRefreshToken = async (email) => {
	try {
		let deletedRT = await RefreshToken.findOneAndDelete({ email });

		if (deletedRT) {
			console.log('Succesfully removed/deleted refresh token'.yellow);
		}

	} catch (error) {
		console.log('Failed to removed/delete refresh token'.red);
		throw new Error(error.message)
	}
}

exports.verify = async (token, tokenKind) => {

	try{

		const tokKey = tokenPicker(tokenKind);
		
		if(!tokKey){
			return isErr = { value : true, message : 'Invalid token kind' };
		}
		
		const verifiedToken = jwt.verify(token, tokKey);
		
		if(verifiedToken.name){
			return isErr = { value : true, message : verifiedToken.message, errName : err.name };
		}

		return isErr = { value : false, output : verifiedToken };

	} catch (err) {
		console.log(err.message);
		return isErr = { value : true, message : err.message, errName : err.name }
	}
}