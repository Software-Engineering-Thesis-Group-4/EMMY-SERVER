const express 	= require('express');
const router 	= express.Router();
const bcrypt 	= require('bcryptjs');
const path 		= require('path');


// import utility
const { encrypt,decrypter } 				= require('../utility/aes');
const { createToken, createRefreshToken }	= require('../utility/jwt')

// import models
const { User }	= require("../db/models/User");
const { Token }	= require("../db/models/Token");

// import auth middlewares
const { isAuthenticated,isAuthenticatedAdmin } = require('../utility/validUser');


// start of route after middlewares
module.exports = (io) => {

	router.post('/login', async (req, res) => {
		
		// if user already logged in redirect to dashboard
		if(req.cookies.emmy && req.cookies.emmyTalk){
			return res.redirect('/');
		}
		try {
			let _email = encrypt(req.body.email);
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
					message: "Invalid email or password."
				});

			} else {
				//create refresh token
				createRefreshToken({ 
					email 		: user.email,
					username	: user.firstname + user.lastname,
					role		: user.accountRole
				})
				// create token
				const token = createToken({ 
					email 		: user.email,
					username	: user.firstname + user.lastname,
					role		: user.accountRole
				})
				// put token in cookie
				res.cookie('emmy', encrypt(token),{ 
					maxAge: parseInt(process.env.COOKIE_DURATION), 
					sameSite: false
				});
				// create cookie with user email in it for refresh token validation
				res.cookie('emmyTalk', user.email,{  
					sameSite: false
				});
				res.send('login succes')
			}
		} catch (error) {
			return res.status(500).send({ message: 'Error on the server.' });
		}
	});

	router.get('/test', isAuthenticatedAdmin, (req, res) => {
		
		res.sendFile(path.resolve(__dirname, 'protected.html'));
	})

	/*-----------------------------------------------------------
	-> POST /auth/logout
	Description:
	logout a user
	-----------------------------------------------------------*/
	router.get('/logout', (req, res) => {

		if(req.cookies.emmy && req.cookies.emmyTalk) {
			// delete token from db
			Token.findOneAndDelete({email: req.cookies.emmyTalk})
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

	/*-----------------------------------------------------------
	-> POST /auth/enroll
	Description:
	Add/enroll a new "Emmy user"
	-----------------------------------------------------------*/
	router.post('/enroll', isAuthenticated, isAuthenticatedAdmin, async (req, res) => {
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