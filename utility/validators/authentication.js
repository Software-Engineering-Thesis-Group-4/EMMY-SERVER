const { body, query } = require('express-validator');


const LoginRules = [
	body('email').exists().notEmpty().isEmail(),
	body('password').exists().notEmpty()
];


const LogoutRules = [
	query('user').trim().escape().exists().notEmpty().isEmail()
];

const VerifySessionRules = [
	query('email').trim().escape(),
	query('access_token').trim().escape()
];

module.exports = {
	LoginRules,
	LogoutRules,
	VerifySessionRules
}