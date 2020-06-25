const moment = require('moment');

function verifyOverdue(timeIn) {
	const now = moment();

	// if time in is logged on the same day -> not overdue
	if (now.isSame(timeIn, 'day')) {
		return false;
	}

	// if the "day" today is past the day of timeIn, check if time is already past 5am in the morning
	const startOfDay = moment().startOf('day').add(4, 'hours');
	if (now.isSameOrAfter(startOfDay)) {
		return true;
	}

	// if time is not yet past 5am in the morning -> not overdue
	return false;
}

module.exports = {
	verifyOverdue
}