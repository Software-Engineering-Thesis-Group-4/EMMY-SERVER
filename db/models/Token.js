const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = Schema({
   email    : { type: String, required: true },
   token    : { type: String, required: true }
});

const Token = mongoose.model('Token', TokenSchema);

module.exports = {
   TokenSchema,
   Token
}