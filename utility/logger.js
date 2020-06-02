const db = require('./mongooseQue');

const pickActionLog = (actionNumb) => {

    let action = null;

    switch(actionNumb){

        case 0 : action = 'Create'          ; break;
        case 1 : action = 'Delete'          ; break;
        case 2 : action = 'Update'          ; break;
        case 3 : action = 'Import'          ; break;
        case 4 : action = 'Export'          ; break;
        case 5 : action = 'Authenticate'    ; break;
        case 6 : action = 'Download'        ; break;
        case 7 : action = 'Upload'          ; break;
        case 8 : action = 'E-mail'          ; break;
        case 9 : action = 'Reset'           ; break;

        default : action = 'Unknown action'; 
    }

    return action;
}



exports.userRelatedLog = async (loggerId,loggerUsername,log,input,errMessage) => {

    /*/======================================//
        TODO 
        DONE LOGS : 8/9
        
        0,1,2,3,4,5,7,8

    //======================================/*/

    try{

        let audLog = null;
        let actionLog = null;

        switch(log){

            case 0  : 
                audLog      = `${loggerUsername} recently changed account settings.`;
                actionLog   = pickActionLog(2);
                break;
            case 1  : 
                audLog      = `Recently changed password for user ${loggerUsername}.`; 
                actionLog   = pickActionLog(2);
                break;
            case 2  : 
                audLog      = `${loggerUsername} logged in.`; 
                actionLog   = pickActionLog(5);
                break;
            case 3  : 
                audLog      = `${loggerUsername} logged out.`; 
                actionLog   = pickActionLog(5);
                break;
            case 8  : 
                audLog      = `Recently changed account image for user ${loggerUsername}.`; 
                actionLog   = pickActionLog(2);
                break;
            

            // admin privileges
            case 4  : 
                audLog      = `${loggerUsername} added new user ${input}.`;
                actionLog   = pickActionLog(0); 
                break;
            case 5  : 
                audLog      = `${loggerUsername} deleted user ${input}.`;
                actionLog   = pickActionLog(1);
                break;
            case 6  : 
                audLog      = `${loggerUsername} recently changed account settings for ${input}.`;
                actionLog   = pickActionLog(2);
                break;
            case 7  : 
                audLog      = `${loggerUsername} recently changed automated email ${input}.`;
                actionLog   = pickActionLog(2);
                break;

            default : audLog = `Unknown employee-log related log for user ${loggerUsername}.`;               
        }


        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }
        
        const newLog = await db.save('AuditLog',{
            description : audLog,
            action      : actionLog,
            user        : loggerId
        });
      
        if(newLog.value){
            console.log('Error adding log'.red);
        } else {
            console.log('Succesfully added log'.grey);
        }
       

    } catch (error) {
        console.log(error);
    }
};

exports.employeeRelatedLog = async (loggerId,loggerUsername,log,emp,errMessage) => {

     /*/======================================//
        TODO 
        DONE LOGS : 8/9
        
        0,1,3,4,5,6,7,8,

    //======================================/*/

    try{

        let audLog = null;
        let actionLog = null;


        switch(log){

            case 0  : 
                audLog      = `${loggerUsername} imported CSV file.`; 
                actionLog   = pickActionLog(3);
                break;
            case 1  : 
                audLog      = `${loggerUsername} exported CSV file.`;
                actionLog   = pickActionLog(4);
                break;
            case 2  : 
                audLog      = `${loggerUsername} exported PDF file.`; 
                actionLog   = pickActionLog(4);
                break;

            
            // admin privileges 
            case 3  : 
                audLog      = `${loggerUsername} added Employee ${emp}.`; 
                actionLog   = pickActionLog(0);
                break;
            case 4  : 
                audLog      = `${loggerUsername} deleted Employee ${emp} (marks as terminated).`;
                actionLog   = pickActionLog(1);
                break;
            case 5  : 
                audLog      = `${loggerUsername} updated employee profile of ${emp}.`; 
                actionLog   = pickActionLog(2);
                break;
            case 6  : 
                audLog      = `${loggerUsername} sent an email to ${emp}.`; 
                actionLog   = pickActionLog(8);
                break;
            case 7  :  
                audLog      = `${loggerUsername} downloaded database backup.`; 
                actionLog   = pickActionLog(6);
                break;
            case 8  : 
                audLog      = `${loggerUsername} restored database backup.`; 
                actionLog   = pickActionLog(7);
                break;

            default : audLog = `Unknown employee-log related log for user ${loggerUsername}.`;                
        }


        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }
        

        const newLog = await db.save('AuditLog',{
            description : audLog,
            action      : actionLog,
            user        : loggerId
        });
      
        if(newLog.value){
            console.log('Error adding log'.red);
        } else {
            console.log('Succesfully added log'.grey);
        }
        

    } catch (error) {
        console.log(error);
    }  
};


exports.employeelogsRelatedLog = async (loggerId,loggerUsername,log,input,errMessage) => {

    /*/======================================//
       
       DONE LOGS : 3/3
        
        0,1,2

   //======================================/*/

    try{
       
        let audLog = null;
        let actionLog = null;


        switch(log){

            //admin privileges
            case 0  : 
                audLog      = `${loggerUsername} deleted employee log ${input}.`; 
                actionLog   = pickActionLog(1);
                break;
            case 1  : 
                audLog      = `${loggerUsername} edited employee log ${input}.`; 
                actionLog   = pickActionLog(2);
                break;
            case 2  : 
                switch(input){
                    case 0 :
                        audLog      = `${actionMaker} didn't submit any sentiment`; 
                        break;
                    case 1 :
                        audLog      = `${loggerUsername} entered angry sentiment`; 
                        break;
                    case 2 :
                        audLog      = `${loggerUsername} entered sad sentiment`; 
                        break;
                    case 3 :
                        audLog      = `${loggerUsername} entered ok sentiment`; 
                        break;
                    case 4 :
                        audLog      = `${loggerUsername} entered happy sentiment`; 
                        break;
                    case 5 :
                        audLog      = `${loggerUsername} entered amazing sentiment`; 
                        break;
                }
                actionLog   = pickActionLog(0);
                break;

            default : audLog = `Unknown employee-log related log for user ${loggerUsername}.` ;                
        }



        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }

        const newLog = await db.save('AuditLog',{
            description : audLog,
            action      : actionLog,
            user        : loggerId
        });
      
        if(newLog.value){
            console.log('Error adding log'.red);
        } else {
            console.log('Succesfully added log'.grey);
        }

    } catch (error) {
        console.log(error);
    }  
};

exports.serverRelatedLog = async (output,log,errMessage) => {

     /*/======================================//
        
        DONE LOGS : 7/7
        
        0,1,2,3,4,5,6

    //======================================/*/


    try{
        
        let audLog = null;
        let actionLog = null;

        switch(log){

            case 0  : 
                audLog      = 'Made database backup (SERVER)'; 
                actionLog   = pickActionLog(0);
                break;
            case 1  : 
                audLog      = `EMMY sent a changed password key email to ${output}.`; 
                actionLog   = pickActionLog(8);
                break;
            case 2  : 
                audLog      = `EMMY sent extreme emotion automated email to ${output}.`; 
                actionLog   = pickActionLog(8);
                break;
            case 3  : 
                audLog      = `Duration for automated email ${output}`;
                actionLog   = pickActionLog(8);
                break;
            case 4  : 
                audLog      = `Updating fields of ${output} in the database`; 
                actionLog   = pickActionLog(2);
                break;
            case 5  : 
                audLog      = `${output} submitted key for reset password`; 
                actionLog   = pickActionLog(1);
                break;
            case 6  : 
                audLog      = `Duration for leaderboard ranking ${output}`;
                actionLog   = pickActionLog(8);
                break;   

            default : audLog = 'Unknown server related log';               
        }

        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }

        const newLog = await db.save('AuditLog',{
            description : audLog,
            action      : actionLog,
            user        : null,
            isServer    : true
        })
      
        if(newLog.value){
            console.log('Error adding log'.red);
        } else {
            console.log('Succesfully added log'.grey);
        }
        

    } catch (error) {
        console.log(error);
    }  
};


