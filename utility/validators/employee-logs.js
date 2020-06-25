const { body, query, param } = require('express-validator');

const GetAllRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape()
]

module.exports = {
	GetAllRules,
}