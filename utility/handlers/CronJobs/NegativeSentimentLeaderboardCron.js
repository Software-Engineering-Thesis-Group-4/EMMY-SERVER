const CronJob = require('cron').CronJob;
const refreshNegativeSentimentCounters = require('../NegativeEmotionLeaderboard/NegativeSentimentCounterRefresh');

function LeaderboardSchedule() {
	return new CronJob(
		process.env.LEADERBOARD_REFRESH_SCHEDULE, // default: “At 12am on the 1st of every 3rd month.”
		refreshNegativeSentimentCounters,
		() => {
			// after refreshing, create a notification here..
			console.log('Refreshed negative sentiment counters.');
		},
		false,
		'Asia/Manila'
	);
}


module.exports = LeaderboardSchedule;