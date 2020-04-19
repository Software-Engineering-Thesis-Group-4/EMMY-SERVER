const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// import utilities
const { encrypt, decrypter } = require('../utility/aes');
const { createToken, createRefreshToken, removeRefreshToken } = require('../utility/jwt');
const { resetPassMail } = require('../utility/mailer');
const { loginValidationRules, registerValidationRules, resetPassValidationRules, resetKeyValidationRules, validate} = require("../utility/validator");

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
	router.post('/login', loginValidationRules, validate, async (req, res) => {

		try {
			let {
				email,
				password } = req.body;

			if (!email) {
				return res.status(401).send({
					message: "No credentials provided."
				})
			}

			let user = await User.findOne({ email });

			if (!user) {
				return res.status(401).send({
					message: `Invalid email or password`
				});
			}

			// validate password
			let passwordIsValid = await bcrypt.compare(password, user.password);

			// if submitted password invalid, return an error
			if (passwordIsValid) {

				// encrypt user credentials
				let email = encrypt(user.email);

				//create refresh token
				createRefreshToken(user.email);

				// create access token
				const access_token = createToken(email, process.env.TOKEN_DURATION);

				// return user credentials and access token
				return res.status(200).send({
					token: access_token,
					email: user.email,
					username: user.username,
					isAdmin: user.isAdmin
				});

			} else {
				return res.status(401).send({
					message: "Invalid email or password."
				});

			}
		} catch (error) {
			return res.status(500).send({ message: 'Error on the server.' });
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
	router.get('/verify', async (req, res) => {
		try {
			// get token & email
			let { token, email } = req.body;

			// find user
			let user = await User.findOne({ email });

			// if user doesn't exist, return error
			if (!user) {
				return res.status(401).send({
					message: `Unauthorized Access. Unknown user.`
				})
			}

			// if user exists, verify access token
			jwt.verify(token, process.env.JWT_KEY, async (err) => {

				// if token is already expired check if refresh token is still valid
				// refresh token is still valid, renew token
				if (err) {

					let refreshToken = await RefreshToken.findOne({ email });

					// refresh token does not exist
					if (!refreshToken) {
						return res.send(401).send({
							message: `Unauthorized Access.`
						})
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
	router.post('/logout', (req, res) => {
		try {
			let { token } = req.body;

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



   // DONE: Implement password length validation
	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/enroll

	Description:
	This route is for registering new users or accounts for Emmy

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll', registerValidationRules, validate, async (req, res) => {
		try {
			// Extract user information
			let {
				email,
				firstname,
				lastname,
				username,
				password,
				confirmPassword,
				isAdmin } = req.body;

			// data cleaning
			email     = email.trim();
			firstname = firstname.trim();
			lastname  = lastname.trim();
			isAdmin   = (isAdmin === "true") ? true : false;

			// Find an existing user and return an error if one already exists.
			let user = await User.findOne({ email });
			if (user) return res.status(409).send("User already exists.");

			// hash password
			password = bcrypt.hashSync(password);

			// create a new User
			let newUser = new User({
				email: email,
				firstname: firstname,
				lastname: lastname,
				username: `${firstname}${lastname}`,
				password: password,
				// isAdmin: (default value is "false" if not provided)
			});

			// if isAdmin is true, set isAdmin field
			if (isAdmin) {
				newUser.isAdmin = true;
			}

			// update user in database
			await newUser.save();

			return res.status(200).send(`Successfully registered a new user (${newUser.email})`);

		} catch (error) {
			console.log(error);
			return res.status(500).send("Server Error. Failed to register user.");
		}
	});




	// FIX RESET PASSWORD PROCESS
	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/reset-password

	Description:
	This is used for handling forgot password requests.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/reset-password', resetPassValidationRules, validate, async (req, res) => {
		try {
			const email = encrypt(req.body.email);

			// check if user has internet access
			const netStatus = await isOnline();

			if (netStatus) {
				const user = await User.findOne({ email: email });
				const username = decrypter(user.firstname) + ' ' + decrypter(user.lastname)
				const decr = decrypter(user.email);

				// create token with user info ------- 1 min lifespan
				const token = createToken({ email: user.email }, '1m');
				// gets last 7 char in token and makes it the verif key
				const key = token.substring(token.length - 7)
				// send key to user email
				resetPassMail(decr, username, key);
				// create cookie with encrypted token expires the same time as the token expires
				res.cookie('emmyPass', encrypt(token), {
					maxAge: parseInt(60000),
					sameSite: false
				});
				res.status(200).send('Succesfuly sent mail')
			} else {
				res.send('Please check internet connection!')
			}
		} catch (error) {
			console.log(error)
			res.status(500).send('Error on server!')
		}
	});

	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/reset-password-key

	Description:
	This route is used for handling the reset key to access reset password page.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	// REFACTOR USING THE ASYNC SYNTAX
	router.post('/reset-password-key', resetKeyValidationRules, validate, (req, res) => {

		const key = req.body.key;

		// check if cookie exist
		if (req.cookies.emmyPass) {
			const decKey = decrypter(req.cookies.emmyPass);
			// check if key is correct
			if (key === decKey.substring(decKey.length - 7)) {
				jwt.verify(decKey, process.env.JWT_KEY, (err, user) => {
					if (err) {
						return res.status(401).send(`Key expired`);
					}
					// if token not yet expired reset password to default 1234
					User.findOneAndUpdate({ email: user.email }, { password: bcrypt.hashSync('1234', 8) }, { new: true })
						.then(user => {
							res.status(200).send(`Succesfuly resetted password for ${user.email}`);
						})
						.catch(err => {
							console.log(err);
							res.status(400).send('failed to reset password');
						})
				});
			} else {
				res.status(400).send('Invalid key');
			}
		} else {
			res.status(401).send('Cookie expired');
		}
	});


	return router;
};