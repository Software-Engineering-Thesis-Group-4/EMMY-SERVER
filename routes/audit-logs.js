const router = require('express').Router();

// import utility
const dbQuery = require('../utility/mongooseQue');


const { verifyAdmin_GET } = require('../utility/authUtil');

module.exports = (io) => {

	/* ---------------------------------------------------------------------------------------------------------------------
	Route:
	POST /api/auditlogs

	Description:
	Api for fetching audit logs of the user currently logged in

	Author:
	Michael Ong
	----------------------------------------------------------------------------------------------------------------------*/
	router.get('/admin', verifyAdmin_GET, async (req, res) => {

		try {

			let auditLogs = await dbQuery.findAllPopulate(`AuditLog`, null, {
				path: 'user',
				select: { password: 0 }
			});

			if (auditLogs.value) {
				return res.send(auditLogs.statusCode).send(auditLogs.message)
			}

			return res.status(200).send(auditLogs.output);

		} catch (error) {
			console.error(error);
			res.status(500).send('Server error. A problem occured when retrieving the audit logs');
		}

	});

	return router;
}

