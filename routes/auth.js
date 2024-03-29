const router = require('express').Router();
const bcrypt = require('bcryptjs');

// import utilities
const { createAccessToken, createRefreshToken, removeRefreshToken, verify } = require('../utility/jwt');
const { loginRules, logoutRules, verifyTokenRules, validate } = require('../utility/validator');
const { validationResult } = require('express-validator');
const logger = require('../utility/logger');
const db = require('../utility/mongooseQue');
const { verifyUser } = require('../utility/authUtil');

// error messages
const ERR_INVALID_CREDENTIALS = "Invalid email or password.";
const ERR_SERVER_ERROR = "Internal Server Error.";
const ERR_UNAUTHORIZED = "Unauthorized Access.";
const ERR_UNAUTHENTICATED = "Unauthenticated.";

// start of route after middlewares
module.exports = () => {

	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/login

	Description:
	This route is used for authenticating users and generating access tokens

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/

	router.post('/login', loginRules, /*validate,*/ async (req, res) => {
		try {

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const extractedErrors = []
				errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
				console.log({ validationErrors: extractedErrors, });
				res.status(401).send(ERR_INVALID_CREDENTIALS);
			}

			// check if email exists in the database
			const user = await db.findOne('user', { email: req.body.email });
			if (user.value) {
				console.error('Invalid Email. User not found.'.red);
				return res.status(401).send(ERR_INVALID_CREDENTIALS); // USER NOT FOUND
			}

			// validate password
			let passwordIsValid = await bcrypt.compare(req.body.password, user.output.password);

			// if submitted password invalid, return an error
			if (passwordIsValid) {

				createRefreshToken(user.output.email);

				// create access token
				const access_token = createAccessToken({});

				//---------------- log -------------------//
				logger.userRelatedLog(user.output._id, user.output.username, 2);


				console.log(access_token);
				// return user credentials and access token
				console.log('User Authenticated. Login Success'.green);
				return res.status(200).send({
					token: access_token,
					email: user.output.email,
					username: user.output.username,
					firstname: user.output.firstname,
					lastname: user.output.lastname,
					isAdmin: user.output.isAdmin,
					photo: user.output.photo,
					userId: user.output._id
				});

			} else {
				console.error('Invalid Password.'.red);
				return res.status(401).send(ERR_INVALID_CREDENTIALS);
			}

		} catch (error) {

			const user = await db.findOne('user', { email: req.body.email });
			//---------------- log -------------------//
			logger.userRelatedLog(user.output._id, user.output.username, 2, null, error.message);

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

	router.post('/verify', verifyTokenRules, validate,
		async (req, res) => {
			try {

				// validate of errors exists in data sanitization +++++++++++++++++++++++++++++
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return res.status(401).send(ERR_UNAUTHORIZED);
				}

				// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

				let { email, access_token } = req.body;
				let user = await db.findOne('user', { email });

				if (user.value) {
					console.error('User not found'.red)
					return res.status(401).send(ERR_UNAUTHENTICATED)
				}

				const verifiedToken = await verify(access_token, 'authtoken');

				if (verifiedToken.value) {

					if (verifiedToken.errName == 'TokenExpiredError') {

						const refTok = await db.findOne('refreshtoken', { email });

						if (refTok.value) {
							console.error('Refresh Token Not Found.'.red);
							return res.status(404).send(ERR_UNAUTHORIZED);
						}

						const verifiedRefToken = await verify(refTok.output.token, 'refreshtoken');

						if (verifiedRefToken.value) {
							removeRefreshToken(email);
							console.error('Refresh Token Expired'.red)
							return res.status(401).send(ERR_UNAUTHORIZED);
						}

						console.log('Refresh Token Valid.'.green);
						let token = createAccessToken(email);

						console.log('Access Token Renewed'.green)
						return res.status(200).send({ token });

					}
					console.log(verifiedToken.message.red);
					return res.status(401).send(ERR_UNAUTHORIZED);
				}

				console.log('Valid Access Token. Verification Success.'.green)
				return res.sendStatus(200);

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
	router.post('/logout', logoutRules, validate, verifyUser, (req, res) => {
		try {

			//  I need this details loggedInUsername, userId
			const { loggedInUsername, userId } = req.body;

			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				res.status(401).send(ERR_UNAUTHENTICATED);
			}


			removeRefreshToken(req.body.email);

			//---------------- log -------------------//
			logger.userRelatedLog(userId, loggedInUsername, 3);


			return res.sendStatus(200);

		} catch (error) {

			const { loggedInUsername, userId } = req.body;
			//---------------- log -------------------//
			logger.userRelatedLog(userId, loggedInUsername, 3, null, error.message);

			console.log(error.message);
			return res.status(500).send(ERR_SERVER_ERROR);
		}
	});


	return router;
};