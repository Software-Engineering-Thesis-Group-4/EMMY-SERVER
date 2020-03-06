const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');

// import User
const { User } = require("../db/models/User");

// session checker middleware
const isAuthenticated = (req, res, next) => {

	if (req.session.username) {
		console.log('authenticated!');
		return next();
	} else {
		return res.status(401).send(`you are not logged in`);
	}

}

module.exports = (io) => {

	router.post('/login', async (req, res) => {
		try {
			let _email = req.body.email;
			let user = await User.findOne({ email: _email });

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
				let { email, username } = user;
				let sessionID = req.sessionID;
				let message = `Login Success.`;

				// attack username and email to session object
				req.session.username = username;
				req.session.email = email;

				// save session to db
				req.session.save();
				
				res.status(200).send({ sessionID, message, username, email });
			}

		} catch (error) {
			return res.status(500).send({ message: 'Error on the server.' });
		}
	});

	router.get('/test', isAuthenticated, (req, res) => {
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
