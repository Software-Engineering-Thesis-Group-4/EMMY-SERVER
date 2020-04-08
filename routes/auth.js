const express 	= require('express');
const router 	= express.Router();
const bcrypt	= require('bcryptjs');
const jwt 		= require('jsonwebtoken');
const isOnline  = require('is-online');

// import utilities
const { encrypt, decrypter } = require('../utility/aes');
const { createToken, createRefreshToken, removeRefreshToken } = require('../utility/jwt');
const mailer = require('../utility/mailer');

// import models
const { User } = require("../db/models/User");
const { RefreshToken } = require("../db/models/RefreshToken");


// start of route after middlewares
module.exports = (io) => {

	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/login

	Description:
	This route is used for authenticating users and generating access tokens

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/login', async (req, res) => {

		try {
			let {
				email,
				password } = req.body;

			if (!email) {
				return res.status(401).send({
					message: "No credentials provided."
				})
			}

			let user = await User.findOne({ email });

			if (!user) {
				return res.status(401).send({
					message: `Invalid email or password`
				});
			}

			// validate password
			let passwordIsValid = await bcrypt.compare(password, user.password);
			 
			// if submitted password invalid, return an error
			if (passwordIsValid) {

				// encrypt user credentials
				let email = encrypt(user.email);

				//create refresh token
				createRefreshToken(email);

				// create access token
				const access_token = createToken({email}, process.env.TOKEN_DURATION);

				// return user credentials and access token
				return res.status(200).send({
					token: access_token,
					email: user.email,
					username: user.username,
					isAdmin: user.isAdmin
				});

			} else {
				return res.status(401).send({
					message: "Invalid email or password."
				});

			}
		} catch (error) {
			console.log(error)
			return res.status(500).send({ message: 'Error on the server.' });
		}
	});





	// FIX VERIFICATION PROCESS
	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/verify

	Description:
	This route is used for verifying if the access token is still valid, if the access token is expired it will then be
	refreshed if the refresh token is still valid. else the user would have to login again.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/verify', async (req, res) => {
		try {
			// get token & email
			let { token, email } = req.body;

			// find user
			let user = await User.findOne({ email });

			// if user doesn't exist, return error
			if (!user) {
				return res.status(401).send({
					message: `Unauthorized Access. Unknown user.`
				})
			}

			// if user exists, verify access token
			jwt.verify(token, process.env.JWT_KEY, async (err) => {

				// if access token is already expired check if refresh token is still valid
				if (err) {

					let refreshToken = await RefreshToken.findOne({ email });

					// refresh token does not exist
					if (!refreshToken) {
						return res.send(401).send({
							message: `Unauthorized Access.`
						})
					}


					// validate refresh token
					jwt.verify(refreshToken, process.env.REFRESH_KEY, (err) => {

						// refresh token expired. return error
						if (err) {
							removeRefreshToken(email);
							return res.send(401).send({
								message: `Session Expired. Unauthorized Access.`
							});
						}

						// renew token
						let token = createToken(email, process.env.TOKEN_DURATION);
						return res.status(200).send({ token });
					})
				}

				// token is valid and is authenticated
				return res.sendStatus(200);
			});

		} catch (error) {
			console.log(error);
			return res.status(500).send(`500 Internal Server Error. ${error.message}`)
		}
	})




	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/logout

	Description:
	This route is used for unauthenticating users and deleting their refresh tokens

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/logout', (req, res) => {
		try {
			let token = req.body.token;
			jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
				if (err) {
					return res.status(401).send('Invalid Token.');
				}

				let email = decrypter(payload.email);
				removeRefreshToken(email);

				return res.status(200).send('Logged out successfully.')
			});

		} catch (error) {
			return res.status(500).send(`500 Server Error. ${error.message}`);
		}
	});




	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/enroll

	Description:
	This route is for registering new users or accounts for Emmy

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/enroll', async (req, res) => {
		try {

			// check if user has internet access
			const netStatus = await isOnline();

			if(netStatus){
				// Extract user information
				let {
					email,
					firstname,
					lastname,
					password,
					isAdmin } = req.body;

				// data cleaning
				email     = email.trim();
				firstname = firstname.trim();
				lastname  = lastname.trim();
				isAdmin   = (isAdmin === "true") ? true : false;


				// Find an existing user and return an error if one already exists.
				let user = await User.findOne({ email });
				if (user) return res.status(409).send("User already exists.");

				// hash password
				password = bcrypt.hashSync(password);

				// create a new User
				let newUser = ({
					email: email,
					firstname: firstname,
					lastname: lastname,
					username: `${firstname}${lastname}`,
					password: password,
					// isAdmin: (default value is "false" if not provided)
				});

				// if isAdmin is true, set isAdmin field
				if (isAdmin) {
					newUser.isAdmin = true;
				}


				// create token where payload is user details
				// set expiration to 1h ----- (exp time still in discussion)
				const token = createToken(newUser, '1h');
				const enctok = encrypt(token);


				// send email verification to user to verify if email exist before putting into database
				mailer.verifyUserMail(newUser.email,newUser.username,enctok);

				return res.status(200).json(`Succesfully sent verification email to ${newUser.username}`);
			} else {
				res.status(502).send('Please check your internet connection!');
			}

		} catch (error) {
			console.log(error);
			return res.status(500).send("Server Error. Failed to register user.");
		}
	});

	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	GET /auth/enroll/verif-mail

	Description:
	This route is for verifying user account by sending link to email

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	
	router.get('/enroll/verif-mail/:token', (req,res) =>{
		
		// get encrypted token from url
		const token 	= req.params.token;
		const decTok 	= decrypter(token);

		jwt.verify(decTok, process.env.JWT_KEY, async(err, user) => {
			if(err){
				return res.status(401).send('Verification expired')
			}

			const newUser = new User ({
				email		: user.email,
				firstname	: user.firstname,
				lastname	: user.lastname,
				username	: `${user.firstname}${user.lastname}`,
				password	: user.password,
				// isAdmin: (default value is "false" if not provided)
			});
			
			// put user in database if token is still valid
			await newUser.save();
			return res.status(200).send(`Successfully registered a new user (${newUser.email})`);
			
		})
		
	});


	// FIX RESET PASSWORD PROCESS
	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/reset-password
	
	Description:
	This is used for handling forgot password requests.
	
	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/reset-password', async (req, res) => {
		try {
			const email = req.body.email;

			// check if user has internet access
			const netStatus = await isOnline();

			if (netStatus) {
				const user = await User.findOne({ email: email });
				if(user){
					const username = user.firstname + ' ' + user.lastname
					const decr = user.email;

					// create token with user info ------- 1 min lifespan
					const token = createToken({ email: user.email }, '1m');

					// gets last 7 char in token and makes it the verif key
					const key = token.substring(token.length - 7)
					
					// send key to user email
					mailer.resetPassMail(decr, username, key);

					// encrypt token before sending to user
					const encTok = encrypt(token);

					res.status(200).send({ resetTok : encTok })
				}
				else {
					res.send('Email doesnt exist in database');
				}
			} else {
				res.status(502).send('Please check your internet connection!');
			}
		} catch (error) {
			console.log(error)
			res.status(500).send('Error on server!')
		}
	});





	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /auth/reset-password-key
	
	Description:
	This route is used for handling the reset key to access reset password page.
	
	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	// REFACTOR USING THE ASYNC SYNTAX
	router.post('/reset-password-key', async (req, res) => {
		try{
			const { key,encTok } = req.body;
			const decTok = decrypter(encTok);
			

			if(key === decTok.substring(decTok.length - 7)){
				jwt.verify(decTok, process.env.JWT_KEY, async (err, payload) => {
					if(err){
						res.status(401).send('Key expired');

					} else {

					// if token is not expired and key is correct, proceed to change password page
						res.status(200).send({ user : payload.email })
					}
				})
				
			} else {
				res.status(400).send('Invalid key');
			}

		} catch (error) {
			console.log(error)
			res.status(500).send('Error on server!')
		} 
	});


	return router;
}; 