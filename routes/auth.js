const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// import User
const { User } = require("../db/models/User");

module.exports = (io) => {

	/*-----------------------------------------------------------
	-> POST /auth/login

	Description:
	Authenticate a user
	-----------------------------------------------------------*/
	router.post('/login', async (req, res) => {
		try {
			// get email
			let email = req.body.email;
			let password = req.body.password;

			// find user using email
			let user = await User.findOne({ email });

			// if exists, compare password
			if (user) {
				console.log(`user found! ${user.email}`)
				let isValid = await bcrypt.compare(password, user.password);

				// if password is valid, generate and sign token
				if (isValid) {
					console.log('authenticated!');

					// sign key
					let token = jwt.sign({
						username: user.username,
						email: user.email,
					}, process.env.JWT_KEY, { expiresIn: '1h' });

					// TODO: encrypt token
					// code here...

					return res.status(200).send({
						email: user.email,
						username: user.username,
						token
					});

				} else {
					console.log('Invalid password.')
					return res.status(401).send(`Invalid email or password.`);
				}

			} else {
				console.log(`User not found!`);
				return res.status(404).send(`Invalid email or password.`);
			}

		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error.`);
		}
	});


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

				if(user) {
					// user verified
					console.log(`User authenticated! (${ user.username })`)
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

	/*-----------------------------------------------------------
	-> POST /auth/logout

	Description:
	Unauthenticate a user
	-----------------------------------------------------------*/
	router.get('/logout', (req, res) => {
		// TODO: create logout
	});

	/*-----------------------------------------------------------
	-> POST /auth/enroll

	Description:
	Add/enroll a new "Emmy user"
	-----------------------------------------------------------*/
	router.post('/enroll', async (req, res) => {
		try {
			// get username and hash password using bcrypt
			let { email, firstname, lastname, password } = req.body;
			console.log(req.body);

			// hash password using bcrypt
			let $_hashedPassword = bcrypt.hashSync(password, 8);

			// create a new user of type [User]
			let newUser = new User({
				email: email,
				firstname: firstname,
				lastname: lastname,
				username: `${firstname}${lastname}`,
				password: $_hashedPassword
			});

			// save user to db
			let registeredUser = await newUser.save();

			console.log(registeredUser);
			res.status(200).send(`Successfully registered a new user ( ${email} )`);

		} catch (error) {
			console.log(error);
			res.status(500).send("There was a problem registering the user.");
			// Add duplicate email error
		}
	});

	return router;
};
