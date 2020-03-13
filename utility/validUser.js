const jwt  		= require('jsonwebtoken');

// import model
const { Token } = require("../db/models/Token");

// import utility
const { encrypt,decrypter } 				= require('../utility/aes');
const { createToken }	= require('../utility/jwt')


// token checker middleware
const isAuthenticated = (req,res,next) => {

    // user needs emmy, emmyTalk cookie and   
    // refresh token saved in db, in order to be authorized
	if(req.cookies.emmy && req.cookies.emmyTalk){
		Token.findOne({email: req.cookies.emmyTalk})
		.then(user => {
			if(!user){
				return res.status(401).send(`you dont have authorization to access this page`);
			} 
		})
		const decryptedCook = decrypter(req.cookies.emmy);
		jwt.verify(decryptedCook,process.env.JWT_KEY, (err,user) => {
			if(err){
				if(err.name === 'TokenExpiredError'){
					console.log('token expired')
					if(req.cookies.emmyTalk){
						Token.findOne({ email: req.cookies.emmyTalk})
						.then(mail => {
							jwt.verify(mail.token, process.env.REFRESH_KEY, (err,user) => {
                                
								if(err){
									return res.status(401).send(`you dont have authorization to access this page`);
								} else {
									const token = createToken({ 
										email 		: user.email,
										username	: user.username,
										role		: user.role
									},process.env.TOKEN_DURATION)
									console.log('making token from refresh token...')
									// updating cookie value and expire time
									res.cookie('emmy', encrypt(token),{ 
										maxAge: parseInt(process.env.COOKIE_DURATION), 
										sameSite: false
									})
									return next();
								}
							})
						})
						.catch(() => {
							// refresh token not valid or deleted in database
							return res.status(401).send(`you dont have authorization to access this page`);
						})		
					} else {
						// if emmytalk cookie is missing or deleted
						return res.status(401).send(`you dont have authorization to access this page`);
					}
				} else {
					console.log(err);
					return res.status(401).send(`you dont have authorization to access this page`);
				}
			} else {
				// if token is not expired
				return next();
			}
		});
	} else {
		// one or both cookies are missing or deleted
		return res.status(401).send(`you dont have authorization to access this page`);
	}
}

// check if user has admin rights
const isAuthenticatedAdmin = (req,res,next) => {
    // user needs emmy, emmyTalk cookie and   
    // refresh token saved in db, in order to be authorized
	if(req.cookies.emmy && req.cookies.emmyTalk){
		Token.findOne({email: req.cookies.emmyTalk})
		.then(user => {
			if(!user){
				return res.status(401).send(`you dont have authorization to access this page`);
			} 
		})
		const decryptedCook = decrypter(req.cookies.emmy);
		jwt.verify(decryptedCook,process.env.JWT_KEY, (err,user) => {
			if(err){
				if(err.name === 'TokenExpiredError'){
					console.log('token expired')
					if(req.cookies.emmyTalk){
						Token.findOne({ email: req.cookies.emmyTalk})
						.then(mail => {
							jwt.verify(mail.token, process.env.REFRESH_KEY, (err,user) => {
                                
								if(err){
									return res.status(401).send(`you dont have authorization to access this page`);
								} else {
									const token = createToken({ 
										email 		: user.email,
										username	: user.username,
										role		: user.role
									},process.env.TOKEN_DURATION)
									console.log('making token from refresh token...')
									// updating cookie value and expire time
									res.cookie('emmy', encrypt(token),{ 
										maxAge: parseInt(process.env.COOKIE_DURATION), 
										sameSite: false
                                    })
                                    
                                    // check if user role is admin
                                    if(user.role === '0'){
                                        return next();
                                    } else {
                                        return res.status(401).send(`you dont have admin authorization to access this page`);
                                    }
								}
							})
						})
						.catch(() => {
							// refresh token not valid or deleted in database
							return res.status(401).send(`you dont have authorization to access this page`);
						})		
					} else {
						// if emmytalk cookie is missing or deleted
						return res.status(401).send(`you dont have authorization to access this page`);
					}
				} else {
					console.log(err);
					return res.status(401).send(`you dont have authorization to access this page`);
				}
			} else {
                // if token is not expired
                // check if user role is admin
                if(user.role === '0'){
             		return next();
                } else {
                    return res.status(401).send(`you dont have admin authorization to access this page`);
                }
			}
		});
	} else {
		// one or both cookies are missing or deleted
		return res.status(401).send(`you dont have authorization to access this page`);
	}
}

module.exports = {
    isAuthenticated,
    isAuthenticatedAdmin
}