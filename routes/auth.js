const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// import utilities
const { encrypt, decrypter } = require('../utility/aes');
const { createToken, createRefreshToken, removeRefreshToken } = require('../utility/jwt');
const { loginValidationRules, validate } = require("../utility/validator");

// import models
const { User } = require("../db/models/User");
const { RefreshToken } = require("../db/models/RefreshToken");

// error messages
const ERR_INVALID_CREDENTIALS = "Invalid email or password.";
const ERR_EMPTY               = "No credentials provided.";
const ERR_SERVER_ERROR        = "Internal Server Error.";
const ERR_UNAUTHORIZED        = "Unauthorized Access.";
const ERR_UNAUTHENTICATED     = "Unauthenticated.";

// start of route after middlewares
module.exports = (io) => {

	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/login

	Description:
	This route is used for authenticating users and generating access tokens

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/login', loginValidationRules, validate, async (req, res) => {

		try {
			let { email, password } = req.body;

			if (!email) {
				return res.status(401).send(ERR_EMPTY)
			}

			let user = await User.findOne({ email });

			if (!user) {
				return res.status(401).send(ERR_INVALID_CREDENTIALS);
			}

			// validate password
			let passwordIsValid = await bcrypt.compare(password, user.password);

			// if submitted password invalid, return an error
			if (passwordIsValid) {

				// encrypt user credentials
				let email = encrypt(user.email);

				//create refresh token
				createRefreshToken({email});

				
				// create access token
				const access_token = createToken( {email} , process.env.TOKEN_DURATION);

				// return user credentials and access token
				return res.status(200).send({
					token: access_token,
					email: user.email,
					username: user.username,
					isAdmin: user.isAdmin
				});

			} else {
				return res.status(401).send(ERR_INVALID_CREDENTIALS);
			}

		} catch (error) {
			console.log(error.message);
			return res.status(500).send(ERR_SERVER_ERROR);
		}

	});



	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/verify

	Description:
	This route is used for verifying if the access token is still valid, if the access token is expired it will then be
	refreshed if the refresh token is still valid. else the user would have to login again.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/verify', async (req, res) => {
		try {
			let { token, email } = req.body;

			let user = await User.findOne({ email });

			if (!user) {
				return res.status(404).send(ERR_UNAUTHORIZED)
			}

			// if user exists, verify access token
			jwt.verify(token, process.env.JWT_KEY, async (err) => {

				// if token is already expired check if refresh token is still valid
				// refresh token is still valid, renew token
				if (err) {

					let refreshToken = await RefreshToken.findOne({ email });

					// refresh token does not exist
					if (!refreshToken) {
						return res.send(401).send(ERR_UNAUTHORIZED)
					}


					// validate refresh token
					jwt.verify(refreshToken, process.env.REFRESH_KEY, (err) => {

						// refresh token expired. return error
						if (err) {
							removeRefreshToken(email);
							return res.send(401).send(ERR_UNAUTHORIZED);
						}

						// renew token
						let token = createToken(email, process.env.TOKEN_DURATION);
						return res.status(200).send(token);
					})
				}

				// token is valid and is authenticated
				return res.sendStatus(200);
			});

		} catch (error) {
			console.log(error.message);
			return res.status(500).send(ERR_SERVER_ERROR)
		}
	})




	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/logout

	Description:
	This route is used for unauthenticating users and deleting their refresh tokens

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/logout', (req, res) => {
		try {
			let { token } = req.body;

			jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
				if (err) {
					return res.status(401).send(ERR_UNAUTHENTICATED);
				}

				let email = decrypter(payload.email);
				removeRefreshToken(email);

				return res.status(200).send('Logged out successfully.')
			});

		} catch (error) {
			console.log(error.message);
			return res.status(500).send(ERR_SERVER_ERROR);
		}
	});


	return router;
};