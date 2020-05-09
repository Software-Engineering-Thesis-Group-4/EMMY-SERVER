const cron = require('node-cron');
const dbBackup = require('./dbbackup.js');
const autoEmail = require('./autoEmail');

const logger = require('../utility/logger');


const {
	 DB_BACKUP_SCHEDULE,
	 AUTO_EMAIL_SCHEDULE,
	 DATE_CHECKER_SCHEDULE } = process.env;


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


// AUTOMATED EMAIL
// SCHEDULED 8:00 pm
cron.schedule(AUTO_EMAIL_SCHEDULE, () => {
	autoEmail.scheduledAutoEmail();
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

