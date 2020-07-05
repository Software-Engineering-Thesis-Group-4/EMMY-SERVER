const { Settings } = require('../../db/models/Settings');

async function initializeSettings() {
	await initAutomatedEmail();
	await initBackup();
	await initDepartments();
}

async function initAutomatedEmail() {
	const automatedEmailSettings = await Settings.findOne({
		$and: [
			{ category: "EMAIL" },
			{ key: "Automated Email" },
		]
	});

	// If not initialized...
	if (!automatedEmailSettings) {
		const init = new Settings({
			category: "EMAIL",
			key: "Automated Email",
			state: {
				enabled: true,
				template: {
					subject: "HR Notification Email",
					messageBody: `
						<p>
							We noticed that you are not feeling alright this past few days. Please know that your HR team cares for you and
							we'd like to hear you out.
							<br><br>
							Having said, may we invite you on your convenient availability over the next couple of weeks for a casual and
							friendly chat? Please reply to this email to set an appointment.
						</p>
						<p>
							Thanks!<br>
							See you soon!
						</p>
					`.trim()
				}
			}
		});

		await init.save();
		console.log('initialized automated email settings');
		return;
	}

	return;
}

async function initBackup() {
	const backupSettings = await Settings.findOne({
		$and: [
			{ category: "DATABASE" },
			{ key: "Backup" },
		]
	});

	if (!backupSettings) {
		const init = new Settings({
			category: "DATABASE",
			key: "Backup",
			state: {
				schedule: {
					hour: 2,
					minute: 0
				}
			}
		});

		await init.save();
		console.log('initialized backup settings');
		return;
	}

	return;
}

async function initDepartments() {
	const departmentsSettings = await Settings.findOne({
		$and: [
			{ category: "EMPLOYEES" },
			{ key: "Departments" },
		]
	});

	if (!departmentsSettings) {
		const init = new Settings({
			category: "EMPLOYEES",
			key: "Departments",
			state: [
				"ADMISSIONS",
				"REGISTRAR",
				"FINANCE",
				"HUMAN RESOURCES ",
				"OFFICE OF STUDENT AFFAIRS",
				"OFFICE OF STUDENT EXPERIENCE AND ADVANCEMENT ",
				"OFFICE OF THE PRESIDENT",
				"OFFICE OF THE COO",
				"IT",
				"CORPORATE COMMUNICATIONS",
				"PURCHASING",
				"ADMIN AND FACILITIES",
				"ACADEMICS COLLEGE",
				"ACADEMICS SHS",
				"CLINIC",
			]
		});

		await init.save();
		console.log('initialized list of departments');
		return;
	}

	return;
}

module.exports = initializeSettings;