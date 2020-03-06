const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');

// import utility
const { encrypt,decrypter } = require('../utility/aes');

// import User
const { User } = require("../db/models/User");

// session checker middleware
const isAuthenticatedAdmin = (req, res, next) => {
	if (req.session.username) {
		if(req.session.accountRole == '0'){
			console.log('authenticated!');
			return next();
		}
	} else {
		return res.send(`you dont have admin authorization to access this page`);
	}
}

const isAuthenticatedUser = (req, res, next) => {
	
	if (req.session.username) {
		if(req.session.accountRole == '0' || req.session.accountRole == '1'){
			console.log('authenticated!');
			return next();
		}
	} else {
		return res.status(401).send(`you dont have authorization to access this page`);
	}
}


module.exports = (io) => {

	router.post('/login', async (req, res) => {
		try {
			let _email = req.body.email;
			let user = await User.findOne({ email: encrypt(_email) });
			console.log(user);
			if (!user) {
				return res.status(401).send(`Invalid email or password.`);
			}
			
			// validate password
			let password = req.body.password;
			let validPassword = await bcrypt.compare(password, user.password);

			// if submitted password invalid, return an error
			if (!validPassword) {
				return res.status(401).send("Invalid email or password");
			} else {
				// get all the information needed to be sent back to user.
				let { email, username, accountRole } = user;
				let sessionID = req.sessionID;
				let message = `Login Success.`;

				// attach user details on to session object
				req.session.username = username;
				req.session.email = email;
				req.session.accountRole = accountRole;

				// save session to db
				req.session.save();
				
				res.status(200).send({ sessionID, message, username, email });
			}

		} catch (error) {
			return res.status(500).send({ message: 'Error on the server.' });
		}
	});

	router.get('/test', isAuthenticatedUser, (req, res) => {
		res.sendFile(path.resolve(__dirname, 'protected.html'));
	})

	/*-----------------------------------------------------------
	-> POST /auth/logout
	Description:
	logout a user
	-----------------------------------------------------------*/
	router.get('/logout', (req, res) => {

		if(!req.session || !req.session.username) {
			console.log('You are not logged in.');
			return res.redirect('/login-test');
		} else {
			req.session.destroy();			//clear cookie
			res.clearCookie('emmy');
			return res.status(200).send("successfully logged out");
		}

	});

	/*-----------------------------------------------------------
	-> POST /auth/enroll
	Description:
	Add/enroll a new "Emmy user"
	-----------------------------------------------------------*/
	router.post('/enroll',isAuthenticatedAdmin, async (req, res) => {
		try {
			// get username and hash password using bcrypt
			let { email, firstname, lastname, password, role } = req.body;
			console.log(req.body);

			let user = await User.findOne({ email: encrypt(email) })

			// if user email already exist in the database
			if(user){
				return res.status(409).send("Email already exist");
			} else {
				// hash password using bcrypt
				let $_hashedPassword = bcrypt.hashSync(password, 8);

				// create a new user of type [User]
				let newUser = new User({
					email		: encrypt(email),
					firstname	: encrypt(firstname),
					lastname	: encrypt(lastname),
					username	: `${encrypt(firstname)}${encrypt(lastname)}`,
					password	: $_hashedPassword,
					accountRole : role
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

	return router;
}; 