const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// import User
const { User } = require('../db/models/User');


module.exports = (io) => {


	/*-----------------------------------------------------------
	-> POST /auth/
	
	Description: 
	Authenticate an "Emmy user" / admin
	-----------------------------------------------------------*/
	router.post('/', (req, res) => {
		username = req.body.username;
		password = req.body.password;

		User.findOne({ username }, (err, user) => {
			if (err) return res.status(500).send({ message: 'Error on the server.' });
			if (!user) return res.status(404).send({ message: `User does not exist.` });

			// compare password
			let validPassword = bcrypt.compareSync(password, user.password);

			if (!validPassword) {
				//
				res.status = 401;
				return res.send({
					auth: false,
					token: null,
					message: "Invalid username or password."
				});
			}

			// sign token
			let token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
				expiresIn: 86400 // expires in 24 hours
			});

			let { username, firstname, lastname } = user;

			res.status(200).send({ token, username, firstname, lastname });
		});
	});

	/*-----------------------------------------------------------
	-> POST /auth/enroll
	
	Description: 
	Add/enroll a new "Emmy user"
	-----------------------------------------------------------*/
	router.post('/enroll', async (req, res) => {
		try {
			// get username and hash password using bcrypt
			let { email, firstname, lastname } = req.body;

			// hash password using bcrypt
			let $_hashedPassword = bcrypt.hashSync(req.body.password, 8);

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
		}
	});


	return router;
}
