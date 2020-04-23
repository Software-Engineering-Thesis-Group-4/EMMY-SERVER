const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// import utilities
const { encrypt, decrypter } = require('../utility/aes');
const { createToken, createRefreshToken, removeRefreshToken } = require('../utility/jwt');

// import models
const { User } = require("../db/models/User");
const { RefreshToken } = require("../db/models/RefreshToken");


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
	router.post('/login', async (req, res) => {

		try {
			let {
				email,
				password } = req.body;

			if (!email) {
				return res.status(401).send("No credentials provided.");
			}

			let user = await User.findOne({ email });

			if (!user) {
				return res.status(401).send(`Invalid email or password`);
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
				return res.status(401).send("Invalid email or password.");
			}
		} catch (error) {
			console.log(error);
			return res.status(500).send('Error on the server.');
		}
	});





	// FIX VERIFICATION PROCESS
	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/verify

	Description:
	This route is used for verifying if the access token is still valid, if the access token is expired it will then be
	refreshed if the refresh token is still valid. else the user would have to login again.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/verify', async (req, res) => {
		try {
			// get token & email
			let { access_token, email } = req.body;
			console.dir(req.body);

			// find user
			let user = await User.findOne({ email });

			// if user doesn't exist, return error
			if (!user) {
				return res.status(401).send(`Unauthorized Access. Unknown user.`)
			}

			// if user exists, verify access token
			jwt.verify(access_token, process.env.JWT_KEY, async (err) => {

				// if access token is already expired check if refresh token is still valid
				if (err) {

					let refreshToken = await RefreshToken.findOne({ email });

					// refresh token does not exist
					if (!refreshToken) {
						return res.send(401).send(`Unauthorized Access.`);
					}


					// validate refresh token
					jwt.verify(refreshToken, process.env.REFRESH_KEY, (err) => {

						// refresh token expired. return error
						if (err) {
							removeRefreshToken(email);
							return res.send(401).send({
								message: `Session Expired. Unauthorized Access.`
							});
						}

						// renew token
						let token = createToken(email, process.env.TOKEN_DURATION);
						return res.status(200).send({ token });
					})
				}

				// token is valid and is authenticated
				return res.sendStatus(200);
			});

		} catch (error) {
			console.log(error);
			return res.status(500).send(`500 Internal Server Error. ${error.message}`)
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
	router.get('/logout', (req, res) => {
		try {
			let token = req.body.token;
			jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
				if (err) {
					return res.status(401).send('Invalid Token.');
				}

				let email = decrypter(payload.email);
				removeRefreshToken(email);

				return res.status(200).send('Logged out successfully.')
			});

		} catch (error) {
			return res.status(500).send(`500 Server Error. ${error.message}`);
		}
	});


	return router;
}; 