const express = require('express')
const router    = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

// import User
const { User } = require('../db/models/User');


module.exports = (io) => {

	// POST /auth
	// Description: authenticate admin user (for login)
	router.post('/', (req, res) => {
		email = req.body.email;
		password = req.body.password;

		User.findOne({ email }, (err, user) => {
			if(err) return res.status(500).send({ message: 'Error on the server.' });
			if(!user) return res.status(404).send({ message: `User does not exist.`});

			// compare password
			let validPassword = bcrypt.compareSync(password, user.password);

			if(!validPassword) {
				//
				res.status = 401;
				return res.send({
					auth    : false,
					token   : null,
					message : "Invalid username or password."
				});
			}

			let { email, firstname, lastname } = user;

			// Create SESSION

			res.status(200).send({ token, username, firstname, lastname });

		});
	});











	// debugging --------------------------------------------------------------------------------------------------------------------------
	router.post('/enroll', async (req, res) => {
		try {
			// get username and hash password using bcrypt
			let {
				username,
				firstname,
				lastname } = req.body;
			let $_hashedPassword = bcrypt.hashSync(req.body.password, 8);

			// create a new user of type [User]
			let newUser = new User({
				username: username,
				firstname: firstname,
				lastname: lastname,
				password: $_hashedPassword
			});

			// save user to db
			let user = await newUser.save();

			var token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
				expiresIn: 86400 //expires in 24 hours
			});

			res.status(200).send({ auth: true, token });

		} catch (error) {
			console.log(error);
			res.status(500).send("There was a problem registering the user.");
		}
	});


	return router;
}
