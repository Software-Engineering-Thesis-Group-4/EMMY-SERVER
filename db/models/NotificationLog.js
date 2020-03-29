const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationLogSchema = Schema({
   type: String,
   date: Date,
   receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   author: { //user reference, if changePass type
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
   },
   emotion: {
      type: Number,
      default: null // not submitted or changePassword type
   }
   // FIX: Add 'read' field as an indicator if the user have seen the notification
});

const Notification = mongoose.model('NotificationLog', NotificationLogSchema);

module.exports = {
   NotificationLogSchema,
   Notification
}