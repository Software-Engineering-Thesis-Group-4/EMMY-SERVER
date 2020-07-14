const { EmotionNotification } = require('../../../db/models/EmotionNotification');

async function createSentimentNotification(emotion, employee_id) {
	const notification = new EmotionNotification({
		employee: employee_id,
		emotion: emotion,
	});

	await notification.save();

	const io = emmy_socketIo;
	io.in('notifications').emit('newEmotionNotification');
}

module.exports = createSentimentNotification;