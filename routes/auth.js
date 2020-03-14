const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');

// import utilities
const { encrypt, decrypter } = require('../utility/aes');
const { createToken, createRefreshToken } = require('../utility/jwt');
const { resetPassMail } = require('../utility/mailer');

// import models
const { User } = require("../db/models/User");
const { Token } = require("../db/models/Token");

// import auth middlewares
const { isAuthenticated, isAuthenticatedAdmin } = require('../utility/validUser');


// start of route after middlewares
module.exports = (io) => {


	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/login

	Description:
	TODO: put route description here...

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/login', async (req, res) => {

		// if user already logged in redirect to dashboard
		if (req.cookies.emmy && req.cookies.emmyTalk) {
			return res.redirect('/');
		}

		try {
			let _email = encrypt(req.body.email);
			let user = await User.findOne({ email: _email });

			// if exists, compare password
			if (user) {
				console.log(`user found! ${user.email}`)
				let isValid = await bcrypt.compare(password, user.password);

				// if submitted password invalid, return an error
				if (!validPassword) {
					res.status = 401;
					return res.send({
						message: "Invalid email or password."
					});

				} else {
					//create refresh token
					createRefreshToken({
						email: user.email,
						username: user.firstname + user.lastname,
						role: user.accountRole
					})
					// create token
					const token = createToken({
						email: user.email,
						username: user.firstname + user.lastname,
						role: user.accountRole
					}, process.env.TOKEN_DURATION)
					// put token in cookie
					res.cookie('emmy', encrypt(token), {
						maxAge: parseInt(process.env.COOKIE_DURATION),
						sameSite: false
					});
					// create cookie with user email in it for refresh token validation
					res.cookie('emmyTalk', user.email, {
						sameSite: false
					});
					res.send('login succes')
				}
			}

		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error.`);
		}
	});


	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/verify

	Description:
	TODO: put route description here...

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/verify', async (req, res) => {
		try {
			let token = req.body.token;
			// console.log(token);

			// TODO: decrypt token
			// code here....

			if (token) {
				// get email from token and find user
				let decoded = jwt.verify(token, process.env.JWT_KEY);
				// console.log(`email: ${ decoded.email }`);

				let user = await User.findOne({ email: decoded.email });
				// console.log(`user: ${ user }`);

				if (user) {
					// user verified
					console.log(`User authenticated! (${user.username})`)
					res.sendStatus(200);
				} else {
					// unauthorized access
					console.log(`Unauthorized Resource Access`);
					res.sendStatus(401);
				}


			} else {
				console.log('invalid token!');
				res.sendStatus(401);
			}

		} catch (error) {

		}
	})


	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/logout

	Description:
	TODO: put route description here...

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/logout', (req, res) => {

		if (req.cookies.emmy && req.cookies.emmyTalk) {
			// delete token from db
			Token.findOneAndDelete({ email: req.cookies.emmyTalk })
				.then(() => {
					console.log('Succesfully deleted token in db')
					//clear cookie
					res.clearCookie('emmy');
					res.clearCookie('emmyTalk');
					return res.status(200).send("successfully logged out");
				})
				.catch(err => console.error(err))
		} else {
			console.log('You are not logged in.');
			return res.redirect('/login-test');
		}
	});


	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/enroll

	Description:
	This route is for registering new users and accounts for Emmy

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll', isAuthenticatedAdmin, async (req, res) => {
		try {
			// get username and hash password using bcrypt
			let { email, firstname, lastname, password, role } = req.body;
			console.log(req.body);

			let user = await User.findOne({ email: encrypt(email) })

			// if user email already exist in the database
			if (user) {
				return res.status(409).send("Email already exist");
			} else {
				// hash password using bcrypt
				let $_hashedPassword = bcrypt.hashSync(password, 8);

				// create a new user of type [User]
				let newUser = new User({
					email: encrypt(email),
					firstname: encrypt(firstname),
					lastname: encrypt(lastname),
					username: `${encrypt(firstname)}${encrypt(lastname)}`,
					password: $_hashedPassword,
					accountRole: role
				});

				// save user to db
				let registeredUser = await newUser.save();

				res.status(200).send(`Successfully registered a new user ( ${decrypter(registeredUser.email)} )`);
			}
		} catch (error) {
			console.log(error);
			res.status(500).send("There was a problem registering the user.");
		}
	});


	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/reset-password

	Description:
	TODO: put route description here...

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/reset-password', async (req, res) => {

		const email = encrypt(req.body.email);

		User.findOne({ email: email })
			.then(user => {
				const username = decrypter(user.firstname) + decrypter(user.lastname)
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
			})
			.catch(error => {
				console.error(error)
				res.status(500).send('Server error')
			})
	});


	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/reset-password-key

	Description:
	TODO: put route description here...

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/reset-password-key', (req, res) => {

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