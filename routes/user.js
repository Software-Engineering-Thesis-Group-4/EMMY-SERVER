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


// start of route after middlewares
module.exports = (io) => {



/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/user/enroll

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
	GET /api/enroll/verif-mail

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
				return res.status(401).send('Verification expired or not prohibited')
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

	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/user/email-notif
	
	Description:
	This route is used for sending email through the HR manager or users.
	
	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	
	router.post('/email-notif', async (req,res) => {
 
		//const { emailBod, sendToEmail, token } = req.body;
		
		// jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
		// 	if(err){
		// 		res.status(401).send('Unauthorized access')
		// 	}
			
		// 	// look for email in db to get username
		// 	const user = await User.find({ ema})

		// })

		const user = await User.findOne({email : 'mokiasdong1427@gmail.com'})
		if(user){
			console.log('hi')
		}
		console.log(user)
		res.send(user)

		// mailer.sendEmailNotif(sendToEmail, 'michael', emailBod)
		// res.send('hi');

		
	})



	// FIX RESET PASSWORD PROCESS
	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/reset-password
	
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
				if(!user){
					res.send('Email doesnt exist');		
				}
				else {
			
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
	POST /api/user/reset-password-key
	
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
			
			jwt.verify(decTok, process.env.JWT_KEY, async (err, payload) => {

				if(err){
					res.status(401).send('Invalid');
				} else {
					if(key === decTok.substring(decTok.length - 7)){
						// if token is not expired and key is correct, proceed to change password page
						res.status(200).send({ user : payload.email })
					} else {
						res.status(400).send('Invalid key');
					}
				}
			})	
			
		} catch (error) {
			console.log(error)
			res.status(500).send('Error on server!')
		} 
    });
    
    return router;
}; 