const express 	= require('express');
const router 	= express.Router();
const bcrypt 	= require('bcryptjs');
const path 		= require('path');
const jwt		= require('jsonwebtoken');

// import utility
const { encrypt,decrypter } 				= require('../utility/aes');
const { createToken, createRefreshToken }	= require('../utility/jwt');
const { resetPassMail }						= require('../utility/mailer');

// import models
const { User }	= require("../db/models/User");
const { Token }	= require("../db/models/Token");


// start of route after middlewares 
module.exports = (io) => {

	router.post('/login', async (req, res) => {
		
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
			if (validPassword) {
				//create refresh token
				const refToken = createRefreshToken({ 
					email 		: user.email,
					username	: user.firstname + user.lastname,
					role		: user.accountRole
				})
				// create token
				const token = createToken({ 
					email 		: user.email,
					username	: user.firstname + user.lastname,
					role		: user.accountRole
				}, process.env.TOKEN_DURATION)
				
				// encrypt token before sending to user
				const encToken = encrypt(token);
				res.send({ auth_token : encToken, user_role: user.accountRole })

			} else {
				return res.status(401).send({
					message: "Invalid email or password."
				});
				
			}
		} catch (error) {
			return res.status(500).send({ message: 'Error on the server.' });
		}
	});

	router.get('/test', (req, res) => {
		
		res.sendFile(path.resolve(__dirname, 'protected.html'));
	})

	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/verify
	Description:
	TODO: put route description here...
	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	// verify user
	router.get('/verify', (req, res) => {

		const token = decrypter(req.body.auth_token); 
		const email = req.body.email;

		jwt.verify(token,process.env.JWT_KEY, (err,user) => {
			if(err){
				if(err.name === 'TokenExpiredError'){
					// if token expired find refresh token of user using user email
					Token.findOne({ email : email})
					.then(valUser => {
						// check if refresh token of user is valid
						jwt.verify(mail.token, process.env.REFRESH_KEY, (err,user) => {
							if(err){
								res.sendStatus(401);
							}
							// create token from refresh token
							const token = createToken({ 
								email 		: user.email,
								username	: user.username,
								role		: user.role
							},process.env.TOKEN_DURATION)
							// send token and role to client
							console.log('making token from refresh token...')
							res.status(200).send({auth_token: token, user_role:user.role})
						})
					})
				} else {
					res.sendStatus(401); 	
				} 
				// if token not expired send token and role
				res.status(200).send({auth_token: req.body.auth_token, user_role:user.role});
			}
		})
	})



	/*-----------------------------------------------------------
	-> POST /auth/logout
	Description:
	logout a user
	-----------------------------------------------------------*/
	router.get('/logout', (req, res) => {

		const token = decrypter(req.body.auth_token);

		jwt.verify(token, process.env.JWT_KEY, (err,user) =>{
			if(err){
				res.send(err.stack)
			} 
			Token.findOneAndDelete({email : user.email})
			.then(user => {
				console.log('Succesfully deleted refresh token in db')
			})
			.catch(error => console.error(error));
		})

	});

	/*-----------------------------------------------------------
	-> POST /auth/enroll
	Description:
	Add/enroll a new "Emmy user"
	-----------------------------------------------------------*/
	router.post('/enroll', async (req, res) => {
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

				const encMail 	= encrypt(email);
				const encFirst 	= encrypt(firstname);
				const encLast 	= encrypt(lastname);
				

				// create a new user of type [User]
				let newUser = new User({
					email		: encMail,
					firstname	: encFirst,
					lastname	: encLast,
					username	: `${encFirst}${encLast}`,
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


	// reset password send mail
	router.post('/reset-password', async (req,res) =>{

		const email = encrypt(req.body.email);

		User.findOne({ email: email })
		.then(user => {
			const username = decrypter(user.firstname) + decrypter(user.lastname)
			const decr = decrypter(user.email);
			// create token with user info ------- 1 min lifespan
			const token = createToken({ email : user.email }, '1m');
			// gets last 7 char in token and makes it the verif key
			const key	= token.substring(token.length - 7)
			// send key to user email
			resetPassMail(decr,username, key);
			// create cookie with encrypted token expires the same time as the token expires
			res.cookie('emmyPass', encrypt(token),{ 
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

	// reset password use key sent on email
	router.post('/reset-password-key', (req,res) =>{

		const key = req.body.key;

		// check if cookie exist
		if(req.cookies.emmyPass){
			const decKey = decrypter(req.cookies.emmyPass);
			// check if key is correct
			if(key === decKey.substring(decKey.length - 7)){
				jwt.verify(decKey, process.env.JWT_KEY, (err, user) =>{
					if(err){
						return res.status(401).send(`Key expired`);
					}
					// if token not yet expired reset password to default 1234
					User.findOneAndUpdate({ email: user.email },{ password: bcrypt.hashSync('1234', 8)},{ new: true })
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