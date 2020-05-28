const db = require('./mongooseQue');
const mailer = require('./mailer');
const logger = require('./logger');
const appSettings = require('./appSettings');
////--------------------------------- GLOBAL VARIABLES ---------------------------------
// TODO: LEADERBOARDS
let startDate   = new Date();
let endDate     = new Date();

// default 1 day 
let dayDuration = 1;
endDate.setDate(endDate.getDate() + dayDuration);

////--------------------------------- GLOBAL VARIABLES ---------------------------------





// checks if the duration entered is finish
// will run checker at cron job every 2:AM same as database backup ( checking time still under discussion)
exports.startEndDateChecker = async () => {

    try{
        
        console.log('Checking if duration is finished for automated email')
        startDate = new Date();

        // if day and month is the same for start date and end date clean db then reset startDate and endDate
        if(startDate.getDate() == endDate.getDate()){

            const employees = await db.findAll('employee',{ sendAutoEmail : true }, 
                                                { firstName : 1, lastName : 1, sendAutoEmail : 1 });

            if(employees.value && employees.statusCode != 204) {
                logger.serverRelatedLog('Employee',4,employees.message);
            } else {
    
                employees.output.forEach(async emp => {
                    

                    const updatedEmp = await db.updateById('employee',emp._id, { sendAutoEmail : false });
                    
                    updatedEmp.value ? logger.serverRelatedLog(`Employee`,4,employees.message) :
                    logger.serverRelatedLog(`${updatedEmp.output.firstName} ${updatedEmp.output.lastName}`,4);
                });

                // reset date 
                startDate = new Date();
                endDate = new Date();
                endDate.setDate(endDate.getDate() + dayDuration);

                console.log('.............................resetting some fields for employee collection'.blue);

                logger.serverRelatedLog('finished',3);
                console.log('Duration finished for automated email.')
            }
        } else {
            // run logger
            logger.serverRelatedLog('not yet finished',3);
            console.log('Duration not yet finsihed for automated email')
        }
    } catch (err){
        console.log(err);
        logger.serverRelatedLog('Employee',4,err.message);
    }
}


exports.putToEmailQueue = async (employeeId) => {

    try{
        
        if(appSettings.activateAutoEmailSystem){
           
            
            const employee = await db.findById('employee',employeeId);

            employee.output.leaderboardEmoCount = employee.output.leaderboardEmoCount + 1;
            employee.output.sendAutoEmail = true;

            await employee.output.save();
            
            logger.serverRelatedLog(`${employee.output.firstName} ${employee.output.lastName}`,4);

        } else {
            const employee = await db.updateById('employee',employeeId,{ 
                leaderboardEmoCount : leaderboardEmoCount + 1,
            });

            employee.value ?
            logger.serverRelatedLog(`employee`,4,err.message) : 
            logger.serverRelatedLog(`${employee.output.firstName} ${employee.output.lastName}`,4);
        }
    } catch (err) {
        console.log(err);
        logger.serverRelatedLog(`employee`,4,err.message);
    }
}


exports.scheduledAutoEmail = async () => {

    try{

        const employees = await db.findAll('employee',{ sendAutoEmail : true },{ email : 1, _id : 0,  firstName : 1 });
        
        if(employees.value){ 
            logger.serverRelatedLog(`no employees.`,2);
        } else {

            employees.output.forEach(async emp => {
                
                const emailErr  = await mailer.sendAutoEmail(emp.email,emp.firstName);
                
                emailErr.value ?
                logger.serverRelatedLog(emp.email,2,emailErr.message) :
                logger.serverRelatedLog(emp.email,2);    
            });
        }
    } catch (err) {
        console.log(err.message);
        logger.serverRelatedLog(`corresponding employees`,2,err.message);
    }
}
