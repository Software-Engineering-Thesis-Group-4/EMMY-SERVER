const { AuditLog } = require('../../../db/models/AuditLog');
const { User } = require('../../../db/models/User');

async function createAuditLog(email, action, description, systemGenerated) {
	const user = await User.findOne({ email });

	const log = new AuditLog({
		action,
		description,
		user: user._id,
		isServer: systemGenerated
	});

	await log.save();
}

module.exports = createAuditLog;