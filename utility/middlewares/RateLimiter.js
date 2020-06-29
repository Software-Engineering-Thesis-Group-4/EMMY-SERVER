const rateLimit  = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

const rateLimiter = rateLimit({
	store: new MongoStore({
		uri: `mongodb://localhost:${process.env.DB_PORT}/${process.env.DB_NAME}`,
		collectionName: "expressRateLimitRecord"
	}),
	max: 100, //number of request threshold - start blocking after 100 requests
	windowMs: 15 * 60 * 1000, //15mins
   delayMs: 0,
   message: "Too many attempts from this IP, please try again after 15mins"
});

module.exports = rateLimiter;