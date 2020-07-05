const { Settings } = require('../../../db/models/Settings');

const updateTemplate = async (subject, messageBodyHTML) => {
	const settings = await Settings.findOne({
		$and: [
			{ category: "EMAIL" },
			{ key: "Automated Email" },
		]
	});

	settings.state.template.subject = subject;
	settings.state.template.messageBody = messageBodyHTML;

	await settings.save();
}

module.exports = updateTemplate;