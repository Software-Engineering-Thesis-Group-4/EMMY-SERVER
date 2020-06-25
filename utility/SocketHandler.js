const { RefreshToken } = require("../db/models/RefreshToken");

module.exports = (io) => {

	io.on('connection', (socket) => {
		socket.on('authenticate', async (data, callback) => {
			try {
				const session = await RefreshToken.findOne({ email: data.email });
				session.socket_id = socket.id;
				await session.save();

				callback('Authenticated!');
			} catch (error) {
				callback('Error');
			}
		});
	})

}