const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// AUDITLOG SCHEMA -----------------------
const AuditLogSchema = Schema({
   date           : { type : Date, default : Date.now },
   action         : { type : String, required : true },
   description    : { type : String, required : true },
   user           : { type : Schema.Types.ObjectId, ref: 'User' },
   isServer       : { type : Boolean, default : false }
});



const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = {
   AuditLogSchema,
   AuditLog
}