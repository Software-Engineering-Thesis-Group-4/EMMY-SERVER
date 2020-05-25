const cron = require('node-cron');
const dbBackup = require('./dbbackup.js');
const autoEmail = require('./autoEmail');
const leaderboard = require('./leaderBoards')
const logger = require('./logger');


const { 
	DB_BACKUP_SCHEDULE, AUTO_EMAIL_SCHEDULE, 
	DATE_CHECKER_SCHEDULE, LEADERBOARDS_MONTH_CHECKER,
	LEADERBOARDS_DAY_CHECKER
} = process.env;


let leadBoardMonth   = new Date();
// default 3 months 
let monthInterval = 3;
leadBoardMonth.setMonth(leadBoardMonth.getMonth() + monthInterval);



const leaderBoardDailyCheck = () => {

	// LEADERBOARDS DAY CHECKER
	// SCHEDULE 2:00 am
	const sched = cron.schedule(LEADERBOARDS_DAY_CHECKER, async () => {

		const durFinished =  await leaderboard.dateChecker();
		durFinished ? sched.stop() : sched.start();
		
		},{
			scheduled : true,
			timezone  : "Asia/Kuala_Lumpur"
	});
	
}

const leaderBoardMonthCheck = (month) => {

	
	const sched = cron.schedule(`0 0 0 1 ${month} *`, async () => {

		leaderBoardDailyCheck();
		console.log('Initializing daily date checker for leaderboard ranking');
		
		// stop cron schedule
		sched.stop();
		

		// reset leadBoardMonth to three months prior to calling this function
		leadBoardMonth = new Date();
		leadBoardMonth.setMonth(leadBoardMonth.getMonth() + monthInterval)

		// start new sched with new date
		leaderBoardMonthCheck(leadBoardMonth.getMonth() + 1)

		},{
			scheduled : true,
			timezone  : "Asia/Kuala_Lumpur"
	});
	
}


// DB BACKUP
// SCHEDULED 2:00 am
cron.schedule(DB_BACKUP_SCHEDULE, async () => {
	const isErr = dbBackup.dbAutoBackUp();
	
	if(isErr.value){
		logger.serverRelatedLog(null,0,isErr.message);
	} else {
		logger.serverRelatedLog(null,0);
	}

},{
	scheduled : true,
	timezone  : "Asia/Kuala_Lumpur"
});


// AUTOMATED EMAIL DATE CHECKER
// EVERY 2:00 am
cron.schedule(DATE_CHECKER_SCHEDULE, () => {
	autoEmail.startEndDateChecker();
},{ 
	scheduled : true, 
	timezone  : "Asia/Kuala_Lumpur" 
});


// AUTOMATED EMAIL
// SCHEDULED 8:00 pm
cron.schedule(AUTO_EMAIL_SCHEDULE, () => {
	autoEmail.scheduledAutoEmail();
},{
	scheduled : true,
	timezone  : "Asia/Kuala_Lumpur"
});


leaderBoardMonthCheck(leadBoardMonth.getMonth() + 1);


