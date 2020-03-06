const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');

// import User
const { User } = require("../db/models/User");

const isAuthenticated = (req, res, next) => {
	// if(req.cookies) {
		if(req.cookies.sessionId == req.session.id) {
			console.log('authenticated!');
			return next();
		}
	// }

	return res.status(401).send(`not authenticaed`);
}

module.exports = (io) => {


	// POST /auth
	// Description: authenticate admin user (for login)
	// router.post('/login', (req, res) => {
	// 	let email = req.body.email;

	// 	User.findOne({ email }, (err, user) => {
	// 		if(err) return res.status(500).send({ message: 'Error on the server.' });
	// 		if(!user) return res.status(404).send({ message: `User ${user} does not exist.`});

	// 		// compare password
	// 		let password = req.body.password;
	// 		let validPassword = bcrypt.compareSync(password, user.password);

	// 		if (!validPassword) {
	// 			//
	// 			res.status = 401;
	// 			return res.send({
	// 				session: false,
	// 				message: "Invalid email or password."
	// 			});
	// 		}
	// 		else {
	// 			let { email, username } = user;
	// 			let sessionID = req.sessionID;
	// 			let message = `Successful LogIn`;

	// 			// create new session for logged in user
	// 			req.session.username = username;
	// 			req.session.email = email;

	// 			res.status(200).send({ sessionID, message, username, email });
	// 		}
	// 	});
	// });

	router.post('/login', async (req, res) => {
		try {
			let _email = req.body.email;
			let user = await User.findOne({ email: _email });

			if (!user) {
				return res.status(404).send({ message: `User ${user} does not exist.` });
			}

			// validate password
			let password = req.body.password;
			let validPassword = await bcrypt.compare(password, user.password);

			// if submitted password invalid, return an error
			if (!validPassword) {
				res.status = 401;
				return res.send({
					session: false,
					message: "Invalid email or password."
				});

			} else {
				let { email, username } = user;
				let sessionID = req.sessionID;
				let message = `Successful LogIn`;

				// create new session for logged in user
				req.session.username = username;
				req.session.email = email;
				req.session.save();

				res.cookie('sessionId', req.session.id);

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

		if (req.session) {
			let user = req.session.username;
			console.log(`${user} logging out`);

			req.session.destroy(function (err) {
				if (!err) {
					let message = "successfully logged out";

					console.log(message);
					res.status(200).send({ message });
				}
				else {
					console.err(err)
					res.status(500).send('Error destroying session');
				}
			})
		}

		else {
			let message = 'noSession object or some kind of error';
			console.log(message);
			res.status(500).send(message);
		}
	})

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
