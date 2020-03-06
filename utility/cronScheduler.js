const cron = require('node-cron');
const dbBackup = require('./dbbackup.js');

const sched = '1 * * * * *';
cron.schedule(sched, () => {
  dbBackup.dbAutoBackUp();
  console.log('running every minute!');
},{
    scheduled : true,
    timezone  : "Asia/Kuala_Lumpur"
  }
);