const { AuditLog } 	= require('../db/models/AuditLog');


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



exports.userRelatedLog = (loggerId,logUsername,log,inputUser,errMessage) => {

    /*/======================================//
        
        DONE LOGS : 3/8
        
        2,3,4

    //======================================/*/

    try{

        let audLog = null;
        let actionLog = null;

        switch(log){

            case 0  : 
                audLog      = `${logUsername} recently changed account settings.`;
                actionLog   = pickActionLog(2);
                break;
            case 1  : 
                audLog      = `Recently changed password for user ${logUsername}.`; 
                actionLog   = pickActionLog(2);
                break;
            case 2  : 
                audLog      = `${logUsername} logged in.`; 
                actionLog   = pickActionLog(5);
                break;
            case 3  : 
                audLog      = `${logUsername} logged out.`; 
                actionLog   = pickActionLog(5);
                break;

            // admin privileges
            case 4  : 
                audLog      = `${logUsername} added new user ${inputUser}.`;
                actionLog   = pickActionLog(0); 
                break;
            case 5  : 
                audLog      = `${logUsername} deleted user ${inputUser}.`;
                actionLog   = pickActionLog(1);
                break;
            case 6  : 
                audLog      = `${logUsername} recently changed account settings for ${inputUser}.`;
                actionLog   = pickActionLog(2);
                break;

            default : audLog = `Unknown employee-log related log for user ${loggerUsername}.`;               
        }


        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }

        const newLog = new AuditLog({
            description : audLog,
            action      : actionLog,
            user        : loggerId
        })
        
        newLog.save();
        console.log('Succesfully added log'.grey);

    } catch (error) {
        console.log(error);
    }
};

exports.employeeRelatedLog = (loggerId,logUsername,log,emp,errMessage) => {

     /*/======================================//
        
        DONE LOGS : 6/8
        
        0,3,4,6,7,8

    //======================================/*/

    try{

        let audLog = null;
        let actionLog = null;


        switch(log){

            case 0  : 
                audLog      = `${logUsername} imported CSV file.`; 
                actionLog   = pickActionLog(3);
                break;
            case 1  : 
                audLog      = `${logUsername} exported CSV file.`;
                actionLog   = pickActionLog(4);
                break;
            case 2  : 
                audLog      = `${logUsername} exported PDF file.`; 
                actionLog   = pickActionLog(4);
                break;
            
            // admin privileges 
            case 3  : 
                audLog      = `${logUsername} added Employee ${emp}.`; 
                actionLog   = pickActionLog(0);
                break;
            case 4  : 
                audLog      = `${logUsername} deleted Employee ${emp} (marks as terminated).`;
                actionLog   = pickActionLog(1);
                break;
            case 5  : 
                audLog      = `${logUsername} updated Employee ${emp}.`; 
                actionLog   = pickActionLog(2);
                break;
            case 6  : 
                audLog      = `${logUsername} sent an email to ${emp}.`; 
                actionLog   = pickActionLog(8);
                break;
            case 7  :  
                audLog      = `${logUsername} downloaded database backup.`; 
                actionLog   = pickActionLog(6);
                break;
            case 8  : 
                audLog      = `${logUsername} restored database backup.`; 
                actionLog   = pickActionLog(7);
                break;

            default : audLog = `Unknown employee-log related log for user ${loggerUsername}.`;                
        }


        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }
        
        const newLog = new AuditLog({
            description : audLog,
            action      : actionLog,
            user        : loggerId
        })
        
        newLog.save();
        console.log('Succesfully added log'.grey);

    } catch (error) {
        console.log(error);
    }  
};


exports.employeelogsRelatedLog = (loggerId,loggerUsername,log,employeeLogId,errMessage) => {

    /*/======================================//
       
       DONE LOGS : 2/2
        
        DONE

   //======================================/*/

    try{
       
        let audLog = null;
        let actionLog = null;


        switch(log){

            //admin privileges
            case 0  : 
                audLog      = `${loggerUsername} deleted employee log ${employeeLogId}.`; 
                actionLog   = pickActionLog(1);
                break;
            case 1  : 
                audLog      = `${loggerUsername} edited employee log ${employeeLogId}.`; 
                actionLog   = pickActionLog(2);
                break;

            default : audLog = `Unknown employee-log related log for user ${loggerUsername}.` ;                
        }



        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }

        const newLog = new AuditLog({
            description : audLog,
            action      : actionLog,
            user        : loggerId
        })

        newLog.save();
        console.log('Succesfully added log'.grey);

    } catch (error) {
        console.log(error);
    }  
};

exports.serverRelatedLog = (output,log,errMessage) => {

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
                audLog      = `Updating fields for ${output}`; 
                actionLog   = pickActionLog(9);
                break;
            case 5  : 
                audLog      = `${output} submitted key for reset password`; 
                actionLog   = pickActionLog(1);
                break;   

            default : audLog = 'Unknown server related log';               
        }

        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }

        const newLog = new AuditLog({
            description : audLog,
            action      : actionLog,
            user        : null,
            isServer    : true
        })
        
        newLog.save();
        console.log('Succesfully added log'.grey);

    } catch (error) {
        console.log(error);
    }  
};

