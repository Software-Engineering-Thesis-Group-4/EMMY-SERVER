const { Schema, model } = require('mongoose');

const SettingsSchema = new Schema({
	category: {
		type: String,
		required: true,
	},
	key: {
		type: String,
		required: true,
	},
	state: {
		type: Object,
		required: true,
	}
});

const Settings = model('Settings', SettingsSchema);

module.exports = {
	Settings,
	SettingsSchema
}
