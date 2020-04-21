const express = require('express');
const router = express.Router();

module.exports = (io) => {

	/*----------------------------------------------------------------------------------------------------------------------
	Route:
	GET /api/users/

	Description:
	?

	Author:
	?
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/', (req, res) => {
		res.end();
	})

	return router;
}