// models
const { Settings } = require('../../../db/models/Settings');

// utilities
const initializeSettings = require('../../database/InitializeDefaultSettings');
const { getInstances } = require('../CronJobs/ScheduledTaskHandler');

const updateAutomatedEmailSettings = async (status, email_messageBody, email_subject) => {

	await initializeSettings();

	const automatedEmailSettings = await Settings.findOne({
		$and: [
			{ category: "EMAIL" },
			{ key: "Automated Email" }
		]
	});

	if(!automatedEmailSettings) {
		const error = new Error('Automated email settings not initialized.');
		error.name = "UninitializedApplicationConfig";
		throw error;
	}

	let new_state = {
		enabled: status,
		template: {
			subject: email_subject,
			messageBody: email_messageBody
		}
	}

	await automatedEmailSettings.updateOne({ state: new_state });

	const { automatedEmailCron } = getInstances();
	if(automatedEmailCron) {
		if(status === "true") {
			if(!automatedEmailCron.running) {
				automatedEmailCron.start();
			}
		} else {
			if(automatedEmailCron.running) {
				automatedEmailCron.stop();
			}
		}
	}

	return new_state;
}

module.exports = updateAutomatedEmailSettings;