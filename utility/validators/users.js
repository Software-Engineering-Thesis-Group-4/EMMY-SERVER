const { body, query, param } = require('express-validator');

const GetAllRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape()
]

const RegisterRules = [
	body('email').trim().escape().exists().notEmpty().isEmail(),
	body('firstname').trim().escape().exists().notEmpty().isAlpha(),
	body('lastname').trim().escape().exists().notEmpty().isAlpha(),
	body('username').trim().escape().exists().notEmpty().isString(),
	body('password').exists().notEmpty().isString().isLength({ min: 6 }),
	body('confirm_password').exists().notEmpty().isString().custom(
		(value, { req }) => {
			if (value !== req.body.password)
				throw new Error('Password confirmation failed.');
			return true;
		}
	),
	body('isAdmin').trim().escape().exists().notEmpty().isBoolean(),
]

const UpdatePasswordRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),

	body('password').exists().notEmpty().isString().isLength({ min: 6 }),
	body('confirm_password').exists().notEmpty().isString().custom(
		(value, { req }) => {
			if (value !== req.body.password)
				throw new Error('Password confirmation failed.');
			return true;
		}
	),
]

const UploadPhotoRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
]

module.exports = {
	GetAllRules,
	RegisterRules,
	UpdatePasswordRules,
	UploadPhotoRules,
}