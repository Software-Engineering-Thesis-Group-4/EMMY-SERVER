const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
   firstname: {
      type: String,
      required: true
   },
   lastname: {
      type: String,
      required: true
   },
   username: {
      type: String,
      unique: true,
      required: true      
   },
   password: {
      type: String,
      required: true
   }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
   UserSchema,
   User
}