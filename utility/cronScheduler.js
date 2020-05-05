const cron = require('node-cron');
const dbBackup = require('./dbbackup.js');
const autoEmail = require('./autoEmail');

const logger = require('../utility/logger');


const { SCHEDULE } = process.env;

cron.schedule(SCHEDULE, () => {
	dbBackup.dbAutoBackUp();
	logger.serverRelatedLog(null,0);
},{
	scheduled : true,
	timezone  : "Asia/Kuala_Lumpur"
});

cron.schedule(SCHEDULE, () => {
	autoEmail.startEndDateChecker();
},{ 
	scheduled : true, 
	timezone  : "Asia/Kuala_Lumpur" 
});