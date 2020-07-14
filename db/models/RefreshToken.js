const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	token: {
		type: String,
		required: true,
		unique: true
	},
	socket_id: {
		type: Array,
		default: null
	}
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = {
	RefreshTokenSchema,
	RefreshToken
}