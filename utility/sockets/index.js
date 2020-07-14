const SOCKET_AuthenticationHandler = require('./authenticate');
const SOCKET_UnauthenticationHandler = require('./unauthenticate');

function SocketIoMain(io) {
	io.on('connection', (socket) => {

		// console.log(`a client connected! (${socket.id})`);

		// authentication --------------------------------------------------------------------
		socket.on('emmy_authenticate', async (data, callback) => {
			try {
				const success = await SOCKET_AuthenticationHandler(socket.id, data.email);
				if (success) {
					socket.join('notifications');
					callback ? callback('Successufully authenticated in socket.io') : false;
				} else {
					callback ? callback('Unable to authenticate user in socket.io') : false;
				}
			} catch (error) {
				callback ? callback(error) : false;
			}
		});

		// sentiment tablet authentication ---------------------------------------------------
		socket.on('authenticate_sentiment_selection', async (data, callback) => {
			if (data && data.p === process.env.SENTIMENT_ACCESS_KEY) {
				socket.join('daily_sentiment');
				socket.emit('AUTHENTICATE_DEVICE', {
					authenticated: true
				});

				callback({
					success: true,
					message: "Device successfully authenticated."
				});
			}

			callback({
				success: false,
				message: 'Incorrect Password.'
			});
		});

		socket.on('disconnect', () => {
			SOCKET_UnauthenticationHandler(socket.id);
		})

	});

}

module.exports = {
	SocketIoMain
};