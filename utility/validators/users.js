const { body, query } = require('express-validator');

const GetAllRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape()
]

const RegisterRules = [
	body('email').trim().escape().exists().notEmpty().isEmail(),
	body('firstname').trim().escape().exists().notEmpty().isAlpha(),
	body('lastname').trim().escape().exists().notEmpty().isAlpha(),
	body('username').trim().escape().exists().notEmpty().isString(),
	body('password').trim().escape().exists().notEmpty().isString().isLength({ min: 6 }),
	body('confirm_password').trim().escape().exists().notEmpty().isString().custom(
		(value, { req }) => {
			if (value !== req.body.password)
				throw new Error('Password confirmation failed.');
			return true;
		}
	),
	body('isAdmin').trim().escape().exists().notEmpty().isBoolean(),
]

module.exports = {
	GetAllRules,
	RegisterRules,
}