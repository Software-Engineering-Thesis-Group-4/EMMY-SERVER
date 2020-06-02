const moment = require('moment');

exports.isOverdue = (timeIn) => {
	let now = new Date();

	if (moment(now).isSame(timeIn, 'day')) {
		// still the same day
		return false;
	}

	let startOfDay = moment().startOf('day').set('hour', 5);
	if (moment(now).isSameOrAfter(startOfDay)) {
		// employee forgot to logout
		return true;
	}

	// NOT yet past 5am in the morning.
	return false;
}