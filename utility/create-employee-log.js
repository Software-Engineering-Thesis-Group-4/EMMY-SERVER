const { EmployeeLog } = require('../db/models/EmployeeLog');
const { Employee } = require('../db/models/Employee');

module.exports = (io, fingerprintNumber) => {
    return new Promise(async (resolve, reject) => {

        const dateNow = new Date();
        let message = "";

        try {
            let employee = await Employee.findOne({ fingerprintId: fingerprintNumber });

            // [1] check if employee does not exist, return an error
            if (!employee) {
                io.sockets.emit('logError', {
                    message: "You are not currently enrolled in the system. Please contact the HR administrator"
                });

                return reject({
                    status: 404,
                    message: 'Employee not found!'
                });
            }

            // [2] if employee doesn't have any latest log
            if (!employee.latestLog) {

                let employeeLog = new EmployeeLog({
                    employee: employee._id,
                    employeeId: employee.employeeId
                });

                let newLog = await employeeLog.save();

                // initialize employee's latest log
                employee.latestLog = {
                    reference: employeeLog._id,
                    date: dateNow
                }

                await employee.save();

                io.sockets.emit('employeeLog', {
                    reference: employeeLog._id,
                    employee: employee.firstName,
                    status: 'in'
                });

                return resolve({
                    status: 200,
                    message: `${employee.firstName} ${employee.lastName} checked in at ${dateNow.toLocaleDateString()}.`
                });

            } else { // get the employee's latestLog

                let employeeLatestLog = await EmployeeLog.findById(employee.latestLog.reference);

                // if employee's latestLog is not found (deleted), create a new one
                if (!employeeLatestLog) {

                    let employeeLog = new EmployeeLog({
                        employee: employee._id,
                        employeeId: employee.employeeId,
                    });

                    let newLog = await employeeLog.save();

                    employee.latestLog = {
                        reference: employeeLog._id,
                        date: dateNow
                    }

                    await employee.save();

                    io.sockets.emit('employeeLog', {
                        reference: employeeLog._id,
                        employee: employee.firstName,
                        status: 'in'
                    });

                    return resolve({
                        status: 200,
                        message: `Log not found (deleted) \n${employee.firstName} ${employee.lastName} checked in at ${dateNow.toLocaleDateString()}.`
                    });

                } else { // if the lastest log exists, check if the employee is currently logged in

                    let timeIn = employeeLatestLog.in;
                    let timeOut = employeeLatestLog.out;

                    // get date tomorrow
                    let dateTomorrow = new Date();
                    dateTomorrow.setDate(dateNow.getDate() + 1);

                    if (timeIn) {
                        
                        if (timeIn > dateTomorrow) {

                            let employeeLog = new EmployeeLog({
                                employee: employee._id,
                                employeeId: employee.employeeId,
                            });

                            let newLog = await employeeLog.save();

                            employee.latestLog = {
                                reference: employeeLog._id,
                                date: dateNow
                            }

                            await employee.save();

                            io.sockets.emit('employeeLog', {
                                reference: employeeLog._id,
                                employee: employee.firstName,
                                status: 'in'
                            });

                            return resolve({
                                status: 200,
                                message: `Employee did not check-out yesterday at ${dateNow.toLocaleDateString()}. \n${employee.firstName} ${employee.lastName} checked in.`
                            });
                            
                        } else if (!timeOut) {
                            employeeLatestLog.out = dateNow;

                            await employeeLatestLog.save();

                            employee.latestLog = {
                                reference: employeeLatestLog._id,
                                date: employeeLatestLog.out
                            }

                            io.sockets.emit('employeeLog', {
                                reference: employeeLatestLog._id,
                                employee: employee.firstName,
                                status: 'out'
                            });

                            return resolve({
                                status: 200,
                                message: `${employee.firstName} ${employee.lastName} checked-out at ${dateNow.toLocaleDateString()}`
                            })

                        } else {
                            io.sockets.emit('logError', {
                                message: "You cannot log multiple attendance in a single day!"
                            });

                            return reject({
                                status: 400,
                                message: `Multiple log violation.`
                            })
                        }
                    }
                }
            }

        } catch (error) {
            return resolve({
                status: 500,
                message: `Server Error: \n${error.message}`
            })
        }
    });
}