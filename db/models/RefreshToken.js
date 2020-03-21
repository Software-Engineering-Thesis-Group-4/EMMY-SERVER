const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefreshTokenSchema = Schema({
   email: { 
      type: String,
      unique: true,
      required: true
   },
   token: { 
      type: String,
      required: true,
      unique: true
   }
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = {
   RefreshTokenSchema,
   RefreshToken
}