const cron = require('node-cron');
const dbBackup = require('./dbbackup.js');

const { SCHEDULE } = process.env;

cron.schedule(SCHEDULE, () => {
  dbBackup.dbAutoBackUp();
  
},{
    scheduled : true,
    timezone  : "Asia/Kuala_Lumpur"
  }
);