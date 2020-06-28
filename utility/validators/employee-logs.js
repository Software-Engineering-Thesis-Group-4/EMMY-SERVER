const { body, query, param } = require('express-validator');

const GetAllRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape()
]

const UpdateRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
	param('id').trim().escape(),

	body('time_in').trim().escape().exists().notEmpty().custom(
		(value, { req }) => {
			if (isNaN(new Date(value))) {
				throw new Error('Not a valid datetime');
			}

			return true;
		}
	),
	body('time_out').trim().escape().exists().notEmpty().custom(
		(value, { req }) => {
			if (isNaN(new Date(value))) {
				throw new Error('Not a valid datetime');
			}

			return true;
		}
	),
	body('emotion_in').trim().escape().exists().notEmpty().isNumeric({ no_symbols: true })
		.isInt({
			min: 0, max: 5
		}),
	body('emotion_out').trim().escape().exists().notEmpty().isNumeric({ no_symbols: true })
		.isInt({
			min: 0, max: 5
		})
]

const DeleteRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
	param('id').trim().escape(),
]

module.exports = {
	GetAllRules,
	UpdateRules,
	DeleteRules
}