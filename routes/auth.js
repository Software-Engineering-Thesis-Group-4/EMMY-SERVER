const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

// import User
const { User } = require("../db/models/User");

module.exports = (io) => {

	   // middleware function to check for logged-in users
	var sessionChecker = (req, res, next) => {
		if (req.session.user && req.cookies.user_sid) {
			console.log('session and cookie exists');
			res.redirect('/dashboard');
			console.log('redirected to /dashboard');
		} else {
			 next();
			 console.log('session or cookie does not exist, not permitted');
		}
	};

	// POST /auth
	// Description: authenticate admin user (for login)
	router.post('/login', (req, res) => {
		let email = req.body.email;

		User.findOne({ email }, (err, user) => {
			if(err) return res.status(500).send({ message: 'Error on the server.' });
			if(!user) return res.status(404).send({ message: `User ${user} does not exist.`});

			// compare password
			let password = req.body.password;
			let validPassword = bcrypt.compareSync(password, user.password);

			if (!validPassword) {
				//
				res.status = 401;
				return res.send({
					session: false,
					message: "Invalid email or password."
				});
			}
			else {

				let { email, username } = user;
				let sessionID = req.sessionID;
				let message = `Successful LogIn`;

				// create new session for logged in user
				req.session.username = username;
				req.session.email = email;

				res.status(200).send({ sessionID, message, username, email });
			}
		});
	});

	router.post('/logout', (req, res) =>{

		if (req.session) {
			let user = req.session.username;
			console.log(`${user} logging out`);

			req.session.destroy(function(err) {
				if (!err){
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
