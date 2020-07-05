const { Employee } = require("../../../db/models/Employee");

async function refreshNegativeSentimentCounters() {
	try {
		const employees = await Employee.find({});
		const refreshAll = [];

		if (employees && employees.length > 0) {

			// set each employee's negativeEmotionCounter back to 0
			employees.forEach(emp => {
				emp.negativeEmotionCounter = 0;
				refreshAll.push(emp.save());
			});

			// execute all at once
			await Promise.all(refreshAll);
		}

	} catch (error) {
		console.log(error);
		console.log('An error occured. Unable to refresh negative sentiment counter.');
	}
}

module.exports = refreshNegativeSentimentCounters;