const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const isOnline = require('is-online');

// import models
const { User } = require("../db/models/User");

// import utilities
const logger = require('../utility/logger');
const { encrypt, decrypter } = require('../utility/aes');
const { createToken } = require('../utility/jwt');
const mailer = require('../utility/mailer');
const { registerRules, resetPassRules, resetKeyRules, validate } = require("../utility/validator");
const apiLimiter = require('../utility/apiLimiter');

// error messages
const ERR_SERVER_ERROR = "Internal Server Error.";
const ERR_DUPLICATE = "Already Exists."


module.exports = (io) => {

	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/users/

	Description:

	Api for fetching data of all users (to be used rendering list of accounts in the admin page)
	Gets all user data except for sensitive information (i.e. password)

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', async (req, res) => {

		try {

			let users = await User.find({},{'password': 0});

			return res.status(200).send(users);

		} catch (error) {
			console.error(error);
			return res.status(500).send('Server error. A problem occured when retrieving users');
		}
	});

	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/users/enroll

	Description:
	This route is for registering new users or accounts for Emmy

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/

	router.post('/enroll', registerRules, validate, async (req, res) => {
		try {

			const errors = validationResult(req);

			// extract logged in user information
			const { userId, userUsername } = req.body;

			if(!errors.isEmpty()) {
				return res.status(400).send(errors.errors);
			}

			// Extract user information
			let { email, firstname, lastname, username, password, confirmPassword, isAdmin } = req.body;

			let user = await User.findOne({ email });
			if (user) return res.status(409).send(ERR_DUPLICATE);

			if(confirmPassword !== password) {
				console.error('Confirm password does not match'.red);
				return res.status(400).send('Confirm password does not match.');
			}

			// hash password
			password = bcrypt.hashSync(password);

			// create a new User
			let newUser = new User({
				email    : email,
				firstname: firstname,
				lastname : lastname,
				username : username,
				password : password,
				isAdmin  : isAdmin
			});

			await newUser.save();

			//---------------- log -------------------//
			logger.userRelatedLog(userId,userUsername,4,username);

			return res.status(200).send(`Successfully registered a new user (${newUser.email})`);

		} catch (error) {

			// error log
			const { userId, userUsername } = req.body;
			logger.userRelatedLog(userId,userUsername,4,undefined,error.message);

			console.log(error);
			return res.status(500).send(ERR_SERVER_ERROR);
		}
	});



	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/users/email-notif

	Description:
	This route is used for sending email through the HR manager or users.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/email-notif', async (req, res) => {

		try{

			// user credentials
			const { userId, userUsername} = req.body;

			const { emailBod, empEmail } = req.body;

			const netStatus = await isOnline();

			if(netStatus){

				mailer.sendEmailNotif(empEmail, userUsername, emailBod);

				logger.employeeRelatedLog(userId,userUsername,6,empEmail);
				res.status(200).send({ resetTok: encTok });

			}


			logger.employeeRelatedLog(userId,userUsername,6,empEmail,'CONNECTION ERROR: Check internet connection!');

			res.status(502).send('Please check your internet connection!');


		} catch (err) {

			const { userId, userUsername} = req.body;
			logger.employeeRelatedLog(userId,userUsername,6,undefined,err.message);

			console.log(err);
			return res.status(500).send(ERR_SERVER_ERROR);
		}

	})



	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/users/reset-password

	Description:
	This is used for handling forgot password requests.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/reset-password', resetPassRules, validate, async (req, res) => {
		try {
			const email = req.body.email;

			// check if user has internet access
			const netStatus = await isOnline();

			if (netStatus) {
				const user = await User.findOne({ email: email });
				if (!user) {
					res.send('Email doesnt exist');
				}
				else {

					const username = user.username;
					const decr = user.email;

					// create token with user info ------- 1 min lifespan
					const token = createToken({ email: user.email }, '1m');

					// gets last 7 char in token and makes it the verif key
					const key = token.substring(token.length - 7)

					// send key to user email
					mailer.resetPassMail(decr, username, key);

					// encrypt token before sending to user
					const encTok = encrypt(token);


					//---------------- log -------------------//
					logger.serverRelatedLog(user.email,1);


					res.status(200).send({ resetTok: encTok });
				}
			} else {
				res.status(502).send('Please check your internet connection!');
			}
		} catch (error) {

			// DECRYPT EMAIL FIRST
			const email = req.body.email;
			//---------------- log -------------------//
			logger.serverRelatedLog(email,1,error.message);
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
	router.post('/reset-password-key', resetKeyRules, validate, async (req, res) => {
		try {
			const { key, resetTok, userId } = req.body;
			const decTok = decrypter(resetTok);

			jwt.verify(decTok, process.env.JWT_KEY, async (err, payload) => {

				if (err) {
					res.status(401).send('Invalid');
				} else {
					if (key === decTok.substring(decTok.length - 7)) {

						// if token is not expired and key is correct, proceed to change password page
						res.status(200).send({ user: payload.email });

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