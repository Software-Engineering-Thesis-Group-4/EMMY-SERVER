const SOCKET_AuthenticationHandler = require('./authenticate');

function SocketIoMain(io) {
	io.on('connection', (socket) => {

		console.log(`a client connected! (${socket.id})`);

		// authentication ------------------------------------------------------
		socket.on('authenticate', async (data, callback) => {
			try {
				await SOCKET_AuthenticationHandler(socket.id, data.email);
				socket.join('notifications');
				callback('Successufully authenticated in socket.io');
			} catch (error) {
				callback(error);
			}
		});

		socket.on('authenticate_sentiment_selection', async (data, callback) => {
			// [1] check if the access key that was submitted is correct (should match env var "SENTIMENT_ACCESS_KEY")
			// [2] if key is correct, join room designated for sentiment selection
		});

		// disconnection -------------------------------------------------------
		socket.on('disconnect', async (reason) => {
			console.log(`A client disconnected! (${socket.id} - ${reason})`)
		});

	});

}

module.exports = {
	SocketIoMain
};