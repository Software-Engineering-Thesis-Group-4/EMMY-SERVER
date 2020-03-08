const express 	= require('express');
const router 	= express.Router();
const bcrypt 	= require('bcryptjs');
const path 		= require('path');
const jwt  		= require('jsonwebtoken');

// import utility
const { encrypt,decrypter } = require('../utility/aes');

// import User
const { User } = require("../db/models/User");

// token checker middleware
const verifyToken = (req,res,next) => {
	if(!req.cookies['emmy']){
		return res.status(401).send(`you dont have authorization to access this page`);
	}

    jwt.verify(req.cookies['emmy'],process.env.JWT_KEY, (err,user) => {
		if(err){
			res.sendStatus(403);
		} else {
			req.user = user;
			return next();
		}
	});

}

// const isAuthenticatedUser = (req, res, next) => {
	
// 	if (req.session.username) {
// 		if(req.session.accountRole == '0' || req.session.accountRole == '1'){
// 			console.log('authenticated!');
// 			return next();
// 		}
// 	} else {
// 		return res.status(401).send(`you dont have authorization to access this page`);
// 	}
// }


module.exports = (io) => {

	router.post('/login', async (req, res) => {
		const email 	= req.body.email;
		const password 	= req.body.password; 

		await User.findOne({ email : encrypt(email)})
			.then(async (user) => {
				if(!user){
					return res.status(401).send('Login failed invalid email or password')
				}
				const validPassword = await bcrypt.compare(password, user.password)
				
				if (!validPassword) {
					return res.status(401).send("Invalid email or password");
				} else {

					const token = jwt.sign({ email : user.email, role  : user.accountRole }, process.env.JWT_KEY,
						{
							expiresIn : '30s'
						})

					res.cookie('emmy', token,{ 
						maxAge: parseInt(process.env.COOKIE_DURATION), 
						sameSite: false
					});
					res.send('login succes')
				}
			})
			.catch(err => {
				console.error(err);
				res.status(500).send('Error on server');
			});
	});

	router.get('/test', verifyToken, (req, res) => {
		res.sendFile(path.resolve(__dirname, 'protected.html'));
	})

	/*-----------------------------------------------------------
	-> POST /auth/logout
	Description:
	logout a user
	-----------------------------------------------------------*/
	router.get('/logout', (req, res) => {

		if(!req.session || !req.session.username) {
			console.log('You are not logged in.');
			return res.redirect('/login-test');
		} else {
			req.session.destroy();			//clear cookie
			res.clearCookie('emmy');
			return res.status(200).send("successfully logged out");
		}

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