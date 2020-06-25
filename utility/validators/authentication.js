const { body, query } = require('express-validator');


const LoginRules = [
	body('email').trim().escape().exists().notEmpty().isEmail(),
	body('password').escape().exists().notEmpty()
];


const LogoutRules = [
	query('user').trim().escape().exists().notEmpty().isEmail()
];

module.exports = {
	LoginRules,
	LogoutRules
}