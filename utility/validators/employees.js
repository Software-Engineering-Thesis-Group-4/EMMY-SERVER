const { body, query, param } = require('express-validator');

const GetAllRules = [
	query('user').trim().escape().exists(),
	query('access_token').trim().escape().exists(),
]

const RegisterOneRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),

	body('employee_id').trim().escape().exists().notEmpty().isString(),
	body('firstname').trim().escape().exists().notEmpty().isString(),
	body('lastname').trim().escape().exists().notEmpty().isString(),
	body('email').trim().escape().exists().notEmpty().isEmail(),
	body('isMale').trim().escape().exists().notEmpty().isBoolean(),
	body('employment_status').trim().escape().exists().notEmpty().isNumeric({ no_symbols: true }),
	body('department').trim().escape().exists().notEmpty().isString(),
	body('job_title').trim().escape().exists().notEmpty().isString(),
	body('fingerprint_id').trim().escape().exists().notEmpty().isNumeric({ no_symbols: true }),
]

const RegisterMultipleRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
]

const DeleteRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
	param('id').trim().escape(),
]

const TerminateRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
	param('id').trim().escape(),
]

const UpdateRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
	param('id').trim().escape(),

	body('employee_id').trim().escape().exists().notEmpty().isString(),
	body('firstname').trim().escape().notEmpty().isString(),
	body('lastname').trim().escape().notEmpty().isString(),
	body('email').trim().escape().notEmpty().isEmail(),
	body('isMale').trim().escape().notEmpty().isBoolean(),
	body('employment_status').trim().escape().notEmpty().isNumeric({ no_symbols: true }),
	body('department').trim().escape().notEmpty().isString(),
	body('job_title').trim().escape().notEmpty().isString(),
	body('fingerprint_id').trim().escape().notEmpty().isNumeric({ no_symbols: true }),
]

const GetLogsOfEmployeeRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
]

const UploadPhotoRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
]

module.exports = {
	GetAllRules,
	RegisterOneRules,
	RegisterMultipleRules,
	UpdateRules,
	DeleteRules,
	TerminateRules,
	GetLogsOfEmployeeRules,
	UploadPhotoRules
}