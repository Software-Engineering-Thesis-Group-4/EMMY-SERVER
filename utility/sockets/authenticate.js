const { RefreshToken } = require("../../db/models/RefreshToken");

const SocketAuthenticationHandler = async (socket_id, email) => {
	const session = await RefreshToken.findOne({ email });
	if (!session) {
		const error = new Error('Socket Authentication Failed. Session does not exist.');
		error.name = "SocketAuthenticationError";
		throw error;
	}

	session.socket_id = socket_id;
	await session.save();

	return true;
}

module.exports = SocketAuthenticationHandler;