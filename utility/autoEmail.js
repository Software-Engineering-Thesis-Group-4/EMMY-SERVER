
const { ExtremeEmo } = require('../db/models/ExtremeEmo');

const mailer = require('./mailer');
const logger = require('./logger');

////--------------------------------- GLOBAL VARIABLES ---------------------------------

let startDate   = new Date();
let endDate     = new Date();

// default 7 days 
let dayDuration = 7;
endDate.setDate(endDate.getDate() + dayDuration);

// max negativeEmotions default 7
let maxNegativEmotions = 2;
 

////--------------------------------- GLOBAL VARIABLES ---------------------------------

exports.editAutoEmailOptions = async (day, negaEmoCap) => {

    try{
        // if options are changed clean database and reset startDate and endDate
        startDate = new Date();
        endDate = new Date();


        dayDuration = day;
        maxNegativEmotions = negaEmoCap;


        endDate.setDate(endDate.getDate() + dayDuration);

        const cleanDb = await ExtremeEmo.remove({});

        if(cleanDb.ok){
            logger.serverRelatedLog('Extreme Emotions',4);
        }
    } catch (err){
        console.log(err);
        logger.serverRelatedLog('Extreme Emotions',4,err.message);
    }
}


// checks if the duration entered is finish
// will run checker at cron job every 2:AM same as database backup ( checking time still under discussion )
exports.startEndDateChecker = async () => {

    try{
        console.log('Checking if duration is finish for automated email')

        // if day and month is the same for start date and end date clean db then reset startDate and endDate
        if(startDate.getDate() == endDate.getDate() && startDate.getMonth() == endDate.getMonth()){
            
            startDate = new Date();
            endDate = new Date();
            endDate.setDate(endDate.getDate() + dayDuration);

            const cleanDb = await ExtremeEmo.remove({});

            if(cleanDb.ok){
                logger.serverRelatedLog('Extreme Emotions',4);
            }

            logger.serverRelatedLog(true,3);
            console.log('Duration finished for automated email')
        } else {
            // run logger
            console.log('Duration not yet finsihed for automated email')
        }
    } catch (err){
        console.log(err);
        logger.serverRelatedLog('Extreme Emotions',4,err.message);
    }
}


exports.sendAutoEmail = async (employeeId) => {

    try{

        const emp = await ExtremeEmo.find({ employee : employeeId });

        // if employee is not yet in extreme emo database save employee into database
        if(!emp){

        const newExtreme = new ExtremeEmo({
            negaEmoCnt : 1,
            employee   : employeeId
        })

        await newExtreme.save();

        } else {

            // check if employee exceedes extreme emotion cap and hasnt received an email yet
            if(emp.negaEmoCnt >= maxNegativEmotions && emp.sentEmail == false)  {
                
                emp.sentEmail = true;
                await emp.save();
                const emailErr = await mailer.sendAutoEmail(emp.employee.email);
                
                if(emailErr.value){
                    logger.serverRelatedLog(emp.employee.email,2,emailErr.message);
                } else {
                    logger.serverRelatedLog(emp.employee.email,2);    
                }
            }

            // if employee hasnt excede extreme emotion
            if(emp.negaEmoCnt < maxNegativEmotions){
                emp.negaEmoCnt = emp.negaEmoCnt + 1;
                await emp.save();   
            }

            // if employee exceedes extreme emotion cap and sad sad emotion is still adding and email already sent
            if(emp.negaEmoCnt >= maxNegativEmotions && emp.sentEmail == true){
                emp.negaEmoCnt = emp.negaEmoCnt + 1;
                await emp.save();  
                // notify HR?
            }
        }
    } catch (err) {
        console.log(err);
        logger.serverRelatedLog(undefined,2,err.message);
    }
}