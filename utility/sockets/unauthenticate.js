const { Socket } = require("../../db/models/Sockets");

async function removeSocketId(disconnectedSocket) {
	const socket = await Socket.findOne({ socket_id: disconnectedSocket });
	if(socket) {
		await socket.remove();
		return true;
	}

	return false;
}

module.exports = removeSocketId;