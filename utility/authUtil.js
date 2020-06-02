const jwt = require('./jwt');
const db = require('./mongooseQue');

exports.verifyAdmin = async (req, res, next) => {

	const { userId, access_token } = req.body;

	const verifiedToken = await jwt.verify(access_token, 'authtoken');

	if (verifiedToken.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	const user = await db.findById('user', userId);

	if (user.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	return user.output.isAdmin ? next() : res.status(401).send("Unauthorized Access.")
}

exports.verifyUser = async (req, res, next) => {

	const { userId, access_token } = req.body;

	const verifiedToken = await jwt.verify(access_token, 'authtoken');

	if (verifiedToken.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	const user = await db.findById('user', userId);

	if (user.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	return next();
}

exports.verifyUser_GET = async (req, res, next) => {

	const { userId, access_token } = req.query;

	const verifiedToken = await jwt.verify(access_token, 'authtoken');

	if (verifiedToken.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	const user = await db.findById('user', userId);

	if (user.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	return next();
}

exports.verifyAdmin_GET = async (req, res, next) => {

	const { userId, access_token } = req.query;

	const verifiedToken = await jwt.verify(access_token, 'authtoken');

	if (verifiedToken.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	const user = await db.findById('user', userId);

	if (user.value) {
		return res.status(401).send("Unauthorized Access.")
	}

	return user.output.isAdmin ? next() : res.status(401).send("Unauthorized Access.")
}