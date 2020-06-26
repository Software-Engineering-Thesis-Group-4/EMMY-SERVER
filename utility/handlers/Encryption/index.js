const crypto = require('crypto');

const secret = process.env.ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);

function encrypt(string) {
	let cipher = crypto.createCipheriv('aes-256-gcm', secret, iv);
	let encrypted = cipher.update(string, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	return encrypted;
}

function decrypt(string) {
	let decipher = crypto.createCipheriv('aes-256-gcm', secret, iv);
	let decrpyted = decipher.update(string, 'hex', 'utf8');
	decrpyted += decipher.final('utf8');

	return decrpyted;
}

module.exports = {
	encrypt,
	decrypt
}