const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmotionNotificationSchema = Schema({
	dateCreated: Date,
	employee: {
		type: Schema.Types.ObjectId,
		ref: 'Employee',
		autopopulate: true,
	},
	emotion: {
		type: Number,
		default: 0 //unsubmitted value
	},
	seenBy: []
});

EmotionNotificationSchema.plugin(require('mongoose-autopopulate'));

const EmotionNotification = mongoose.model('EmotionNotificationLog', EmotionNotificationSchema);

module.exports = {
	EmotionNotificationSchema,
	EmotionNotification
}