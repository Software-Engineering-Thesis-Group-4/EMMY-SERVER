const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('colors').enable();

// import utilities
const { createAccessToken, createRefreshToken, removeRefreshToken } = require('../utility/jwt');
const { validateLogin } = require('../utility/validator');
const { body, validationResult } = require('express-validator');
const logger = require('../utility/logger');

// import models
const { User } = require("../db/models/User");
const { RefreshToken } = require("../db/models/RefreshToken");

// error messages
const ERR_INVALID_CREDENTIALS = "Invalid email or password.";
const ERR_SERVER_ERROR = "Internal Server Error.";
const ERR_UNAUTHORIZED = "Unauthorized Access.";
const ERR_UNAUTHENTICATED = "Unauthenticated.";

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
	router.post('/login', validateLogin, async (req, res) => {
		try {


			// data sanitization
			let errors = validationResult(req);
			if (!errors.isEmpty()) {
				console.error('Invalid Credentials Format.'.red);
				return res.status(401).send(ERR_INVALID_CREDENTIALS);
			}

			// check if email exists in the database
			const user = await User.findOne({ email: req.body.email });
			if (!user) {
				console.error('Invalid Email. User not found.'.red);
				return res.status(401).send(ERR_INVALID_CREDENTIALS); // USER NOT FOUND
			}

			// validate password
			let passwordIsValid = await bcrypt.compare(req.body.password, user.password);

			// if submitted password invalid, return an error
			if (passwordIsValid) {

				//create refresh token
				createRefreshToken({ email: user.email });

				// create access token
				const access_token = createAccessToken();

				//---------------- log -------------------//
				logger.userRelatedLog(user._id, user.username, 2);

				// return user credentials and access token
				console.log('User Authenticated. Login Success'.green);
				return res.status(200).send({
					token: access_token,
					email: user.email,
					username: user.username,
					firstname: user.firstname,
					lastname: user.lastname,
					isAdmin: user.isAdmin,
					photo: user.photo,
					userId: user._id
				});

			} else {
				console.error('Invalid Password.'.red);
				return res.status(401).send(ERR_INVALID_CREDENTIALS);
			}

		} catch (error) {

			const user = await User.findOne({ email: req.body.email });
			//---------------- log -------------------//
			logger.userRelatedLog(user._id, user.username, 2, null, error.message);

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
	router.post('/verify',
		[
			body('access_token').notEmpty().isJWT(),
			body('email').trim().notEmpty().isEmail()
		],
		async (req, res) => {
			try {

				// validate of errors exists in data sanitization +++++++++++++++++++++++++++++
				const errors = validationResult(req);

				if (!errors.isEmpty()) {
					console.error('Invalid Credentials.'.red);
					return res.status(401).send(ERR_UNAUTHORIZED);
				}
				// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

				let { access_token, email } = req.body;

				let user = await User.findOne({ email });
				if (!user) {
					console.error('User not found'.red)
					return res.status(401).send(ERR_UNAUTHENTICATED)
				}

				// if user exists, verify access token
				jwt.verify(access_token, process.env.JWT_KEY, (err) => {

					// if there are no errors...
					if (!err) {
						console.log('Valid Access Token. Verification Success.'.green)
						return res.sendStatus(200);
					}

					if (err.name === 'JsonWebTokenError') {
						console.error('Invalid Access Token.'.red)
						return res.status(401).send(ERR_UNAUTHORIZED);
					}

					// if token is expired check, get refresh token of user
					if (err.name === 'TokenExpiredError') {

						// if refresh token is VALID, renew token
						RefreshToken.findOne({ email }, (err, refresh_token) => {

							if (err) {
								console.error('Refresh Token Not Found.'.red);
								return res.status(404).send(ERR_UNAUTHORIZED);
							}

							// validate refresh token
							jwt.verify(refresh_token.token, process.env.REFRESH_KEY, (err, decoded) => {

								if (!err) {
									console.log('Refresh Token Valid.'.green);
									let token = createAccessToken(email);

									console.log('Access Token Renewed'.green)
									return res.status(200).send(token);
								}

								// refresh token expired. return error
								if (err.name === 'TokenExpiredError') {
									removeRefreshToken(email);
									console.error('Refresh Token Expired'.red)
									return res.status(401).send(ERR_UNAUTHORIZED);
								}

								if (err.name === 'JsonWebTokenError') {
									removeRefreshToken(email);
									console.error('Invalid Refresh Token'.bgRed.black);
									return res.status(401).send(ERR_UNAUTHORIZED);
								}
							});
						});
					}
				});

			} catch (error) {
				console.log(error.message);
				return res.status(500).send(ERR_SERVER_ERROR);
			}
		}
	);




	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/logout

	Description:
	This route is used for unauthenticating users and deleting their refresh tokens

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/logout', body('email').trim().notEmpty().isEmail(), (req, res) => {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				console.error('Invalid Credential Format.'.red);
				return res.sendStatus(400);
			}

			const { userUsername, userId } = req.body;

			removeRefreshToken(req.body.email);

			//---------------- log -------------------//
			logger.userRelatedLog(userId, userUsername, 3);


			return res.sendStatus(200);

		} catch (error) {

			const { userUsername, userId } = req.body;

			//---------------- log -------------------//
			logger.userRelatedLog(userId, userUsername, 3, null, error.message);

			console.log(error.message);
			return res.status(500).send(ERR_SERVER_ERROR);
		}
	});


	return router;
};