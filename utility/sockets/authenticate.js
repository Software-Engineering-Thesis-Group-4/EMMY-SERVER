const { Socket } = require("../../db/models/Sockets");
const { RefreshToken } = require("../../db/models/RefreshToken");

const SocketAuthenticationHandler = async (socket_id, email) => {
	try {
		const session = await RefreshToken.findOne({ email });
		if (!session) {
			const error = new Error('Socket Authentication Failed. Session does not exist.');
			error.name = "SocketAuthenticationError";
			throw error;
		}

		const socketSession = new Socket({
			email,
			socket_id
		});

		await socketSession.save();
		return true;

	} catch (error) {
		console.error(error);
		return false;
	}

}

module.exports = SocketAuthenticationHandler;