const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const isOnline = require('is-online');

// import models
const { User } = require("../db/models/User");
const { EmployeeDataNotification } = require("../db/models/EmployeeDataNotif");
const { EmotionNotification } = require("../db/models/EmotionNotification");

// import utilities
const logger = require('../utility/logger');
const { encrypt, decrypter } = require('../utility/aes');
const mailer = require('../utility/mailer');
const { registerRules, resetPassRules, resetKeyRules, validate } = require("../utility/validator");
const { validationResult } = require('express-validator');
const notifHandler = require('../utility/notificationHandler');

// error messages
const ERR_INVALID_CREDENTIALS = "Invalid email or password.";
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

			let users = await db.findAll('user',null,{'password': 0});

			return res.status(200).send(users.output);

		} catch (error) {
			console.error(error);
			return res.status(500).send(`${ERR_SERVER_ERROR} A problem occured when retrieving users`);
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

			// user credentials from req body
			const { userId, loggedInUsername } = req.body;

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.status(401).send(ERR_INVALID_CREDENTIALS.red);
			}

			// Extract user information
			let { email, firstname, lastname, username, password, confirmPassword, isAdmin } = req.body;

			const existingEmail = await db.findOne('user',{ email });

			if(!existingEmail.value){
				console.log('at email')
				return res.status(409).send('Email ' + ERR_DUPLICATE);
			}

			const existingUsername = await db.findOne('user',{ username });

			if(!existingUsername.value){
				return res.status(409).send('Username ' +  ERR_DUPLICATE);
			}

			if(confirmPassword !== password) {
				console.error('Confirm password does not match'.red);
				return res.status(400).send('Confirm password does not match.');
			}

			// hash password
			password = bcrypt.hashSync(password);

			const newUser = await db.save('user',{
				email    : email,
				firstname: firstname,
				lastname : lastname,
				username : username,
				password : password,
				isAdmin  : isAdmin
			} )

			// create a new User
			if(newUser.value){
				logger.userRelatedLog(userId,loggedInUsername,4,undefined,newUser.message);
				return res.status(422).send(`Error registering a new user`);
			}

	
			logger.userRelatedLog(userId,loggedInUsername,4,username);
			return res.status(200).send(`Successfully registered a new user (${newUser.output.email})`);

		} catch (error) {

			// error log
			const { userId, loggedInUsername } = req.body;
			logger.userRelatedLog(userId,loggedInUsername,4,undefined,error.message);

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

			// user credentials from req body
			const { userId, loggedInUsername} = req.body;
			const { emailBod, empEmail } = req.body;
			
			const netStatus = await isOnline();

			if(netStatus){

				const isErr = await mailer.sendEmailNotif(empEmail, loggedInUsername, emailBod);
				
				if(isErr.value){
					logger.employeeRelatedLog(userId,loggedInUsername,6,empEmail,isErr.message);
					console.log('Error sending email'.yellow);
					res.status(500).send('Error sending email');
				} else {
					logger.employeeRelatedLog(userId,loggedInUsername,6,empEmail);
					res.status(200).send("Successfully sent notification email");
				}

			} else {
				logger.employeeRelatedLog(userId,loggedInUsername,6,empEmail,'CONNECTION ERROR: Check internet connection!');	
				res.status(502).send('Please check your internet connection!');
			}

			
		} catch (err) {
			
			const { userId, loggedInUsername} = req.body;
			logger.employeeRelatedLog(userId,loggedInUsername,6,undefined,err.message);
		
			console.log(err);
			return res.status(500).send(ERR_SERVER_ERROR);
		}

	})


	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/users/change-account-photo

	Description:

	Api for fetching data of all users (to be used rendering list of accounts in the admin page)
	Gets all user data except for sensitive information (i.e. password)

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/change-account-photo', async (req, res) => {

		try {

			// user credentials from request body
			const { loggedInUsername, userId } = req.body;
			
			if(!req.files){
				return res.status(204).send('Not selected a file or file is empty! Please select a file');
			} 

			const userPhoto = req.files.accPhoto;
			const isErr = await accountSettings.changeUserPhoto(userPhoto,userId);

		

			if(isErr.value){
				logger.userRelatedLog(userId,loggedInUsername,8,null,isErr.message);
				return res.status(422).send('Error changing user account photo');
			}

				logger.userRelatedLog(userId,loggedInUsername,8);
				return res.status(200).send(`Successfully changed user account photo for ${isErr.output.username}`)
			
		} catch (error) {
			console.error(error.message);
			return res.status(500).send('Server error. A problem occured when changing user account photo');
		}
	});


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

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.status(401).send(ERR_INVALID_CREDENTIALS.red);
			}

			const email = req.body.email;
			

			// check if user has internet access
			const netStatus = await isOnline();

			if (netStatus) {

				const user = await db.findOne('user', { email });

				if (user.value) {
					return res.status(500).send('Email doesnt exist in database');
				}
				
				const isErr = await accountSettings.resetPassword(user.output.email);

				if(isErr.value){
					logger.serverRelatedLog(user.output.email,1,isErr.message);
					return res.status(500).send('Error sending email!');
				}

				logger.serverRelatedLog(user.output.emailss,1);
				return res.status(200).send({ resetTok: isErr.output.resetTok });

			} else {
				logger.serverRelatedLog(email,1,`CONNECTION ERROR: Check internet connection!`);
				return res.status(502).send('Please check your internet connection!');
			}
		} catch (error) {

			// DECRYPT EMAIL FIRST
			const email = req.body.email;
			//---------------- log -------------------//
			logger.serverRelatedLog(email,1,error.message);
			console.log(error.message)
			res.status(500).send('Error on server!');
		}
	});


	router.post('/asd', (req,res) => {

		const authHeader = req.headers['authorization'];
		console.log(authHeader);
		const token = authHeader && authHeader.split(' ')[1]   //bearer TOKEN
		console.log(token)
		res.send(token)
	})



	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/users/reset-password-key

	Description:
	This route is used for handling the reset key to access reset password page.

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.post('/reset-password-key', resetKeyRules, validate, async (req, res) => {
		
		try {

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.status(401).send('Invalid Key Format'.red);
			}

			const { key, reset_token } = req.body;
			

			const keyChecker = await accountSettings.resetPasswordKey(reset_token,key);
			
			if (keyChecker.value) {
				logger.serverRelatedLog(undefined,5,keyChecker.message);
				return res.status(400).send(keyChecker.message);
			} else {
				logger.serverRelatedLog(keyChecker.output.email,5);
				return res.status(200).send({ user: keyChecker.output });
			}

		} catch (error) {
			console.log(error.message);
			logger.serverRelatedLog(undefined,5,error.message);
			return res.status(500).send('Error on server!');
		}
	});

	return router;
};