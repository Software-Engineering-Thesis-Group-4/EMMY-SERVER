const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const isOnline = require('is-online');


// import utilities
const logger = require('../utility/logger');
const { encrypt, decrypter } = require('../utility/aes');
const token = require('../utility/jwt');
const mailer = require('../utility/mailer');
const accountSettings = require('../utility/accountSettings');
const db = require('../utility/mongooseQue');


const {
	registerValidationRules,
	resetPassValidationRules,
	resetKeyValidationRules,
	validate
} = require("../utility/validator");
const { validationResult } = require('express-validator');

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

			let users = await db.findAll('user',null,{'password': 0});

			return res.status(200).send(users.output);

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
	router.post('/enroll', registerValidationRules, async (req, res) => {
		try {

			// user credentials from req body
			const { userId, loggedInUsername } = req.body;

			const errors = validationResult(req);

			if(!errors.isEmpty()) {
				return res.status(400).send(errors.errors);
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
	POST /api/user/email-notif
	
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
	router.post('/reset-password', async (req, res) => {
		try {

			const email = req.body.email;
			

			// check if user has internet access
			const netStatus = await isOnline();

			if (netStatus) {

				const user = await db.findOne('user', { email });

				if (user.value) {
					return res.status(500).send('Email doesnt exist in database');
				}
				

				const username 		= user.username;
				const decryptUser 	= user.email;

				// create token with user info ------- 1 min lifespan
				const resetToken = token.createResetPassToken({ email : user.email });

				// gets last 7 char in token and makes it the verif key
				const key = resetToken.substring(resetToken.length - 7)

				// encrypt token before sending to user
				const encTok = encrypt(resetToken);

				// send key to user email
				const isErr = await mailer.resetPassMail(decryptUser, username, key);


				if(isErr.value){
					logger.serverRelatedLog(email,1,isErr.message);
					return res.status(500).send('Error sending email!');
				} else {
					//---------------- log -------------------//
					logger.serverRelatedLog(user.email,1);
					return res.status(200).send({ resetTok: encTok });
				}

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





	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/user/reset-password-key
	
	Description:
	This route is used for handling the reset key to access reset password page.
	
	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	// TODO: REFACTOR: GET TOKEN FROM AUTHENTICATION HEADER ("BEARER TOKEN")
	router.post('/reset-password-key', resetKeyValidationRules, validate, async (req, res) => {
		try {

			const { key, resetTok } = req.body;
			const decTok = decrypter(resetTok);

			jwt.verify(decTok, process.env.JWT_KEY, async (err, payload) => {

				if (err) {

					switch (err.name) {
						
						case 'TokenExpiredError':
							console.error('Reset Password Token Expired'.red)
							logger.serverRelatedLog(payload.email,5,err.name);
							return res.status(401).send("Unauthorized Access.");

						case 'JsonWebTokenError':
							console.error('Reset Password Token'.red)
							logger.serverRelatedLog(payload.email,5,err.name);
							return res.status(401).send("Unauthorized Access.");

						default:
							console.error('Reset Password Token'.red)
							logger.serverRelatedLog(payload.email,5,err.name);
							return res.status(401).send("Unauthorized Access.");
					}
				} else {
					if (key === decTok.substring(decTok.length - 7)) {

						// if token is not expired and key is correct, proceed to change password page
						logger.serverRelatedLog(payload.email,5);
						res.status(200).send({ user: payload.email });

					} else {
						logger.serverRelatedLog(payload.email,5,'Invalid reset password key');
						res.status(400).send('Invalid reset password key');
					}
				}
			})

		} catch (error) {
			console.log(error.message);
			logger.serverRelatedLog(undefined,5,error.message);
			return res.status(500).send('Error on server!');
		}
	});

	return router;
}; 