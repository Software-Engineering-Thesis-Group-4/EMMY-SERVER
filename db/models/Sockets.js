const { Schema, model } = require('mongoose');

const SocketSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	socket_id: {
		type: String,
		required: true,
	}
});

const Socket = model('Socket', SocketSchema);

module.exports = {
	SocketSchema,
	Socket
}