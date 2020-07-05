const SOCKET_AuthenticationHandler = require('./authenticate');

function SocketIoMain(io) {
	io.on('connection', (socket) => {

		// console.log(`a client connected! (${socket.id})`);

		// authentication --------------------------------------------------------------------
		socket.on('authenticate', async (data, callback) => {
			try {
				await SOCKET_AuthenticationHandler(socket.id, data.email);
				socket.join('notifications');
				callback('Successufully authenticated in socket.io');
			} catch (error) {
				callback(error);
			}
		});

		// sentiment tablet authentication ---------------------------------------------------
		socket.on('authenticate_sentiment_selection', async (data, callback) => {
			if (data && data.p === process.env.SENTIMENT_ACCESS_KEY) {
				callback('authenticated');
				socket.join('daily_sentiment');
			}
			
			callback('Incorrect Password.');
		});

	});

}

module.exports = {
	SocketIoMain
};