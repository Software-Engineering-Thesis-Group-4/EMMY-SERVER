const cron = require('node-cron');
const dbBackup = require('./dbbackup.js');

const logger = require('../utility/logger');


const { SCHEDULE } = process.env;

cron.schedule(SCHEDULE, () => {
  dbBackup.dbAutoBackUp();
  logger.serverRelatedLog(null,0);
},{
    scheduled : true,
    timezone  : "Asia/Kuala_Lumpur"
  }
);