const db = require('./mongooseQue');
const logger = require('./logger');
const cron = require('node-cron');
////--------------------------------- GLOBAL VARIABLES ---------------------------------

let startDate   = new Date();
let endDate     = new Date();

// default 3 months 
let monthInterval = 3;
endDate.setMonth(endDate.getMonth() + monthInterval);

////--------------------------------- GLOBAL VARIABLES ---------------------------------


exports.angryEmoIncrementer = async (employeeId) => {

    try{

        const employee = await db.findById('employee',employeeId);
        employee.output.leaderboardEmoCount = employee.output.leaderboardEmoCount + 1;

        await employee.output.save();

        logger.serverRelatedLog(`${employee.output.firstName} ${employee.output.lastName}`,4);
    } catch (err) {
        console.log(err.message);
        logger.serverRelatedLog(`employee`,4,err.message)
    }
}

exports.dateChecker = async () => {

    try{
        
        console.log('Checking if duration is finished for leaderboard ranking')
        startDate = new Date();
        
        if(startDate.getDate() == endDate.getDate() && startDate.getMonth() == endDate.getMonth()){

            const employees = await db.findAll('employee',{ leaderboardEmoCount : { $gt: 0 }}, 
            { firstName : 1, lastName : 1, leaderboardEmoCount : 1 });
            
            if(employees.value) {

                logger.serverRelatedLog('employee',4,employees.message);

            } else {
                employees.output.forEach(async emp => {
                    emp.leaderboardEmoCount = 0;
                    await emp.save();
                    logger.serverRelatedLog(`${emp.firstName} ${emp.lastName}`,4);
                });
                
                console.log('.............................resetting some fields for employee collection'.blue);
            }
            // reset date 
            startDate = new Date();
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + monthInterval);

            logger.serverRelatedLog('finished',6);
            console.log('Duration finished for leaderboard ranking.')

            return true;
        } else {
            // run logger
            logger.serverRelatedLog('not yet finished',6);
            console.log('Duration not yet finsihed for leaderboard ranking')
            return false
        }
    } catch (err) {
        console.log(err.message);
        logger.serverRelatedLog(`employee`,4,err.message)
    }
}

