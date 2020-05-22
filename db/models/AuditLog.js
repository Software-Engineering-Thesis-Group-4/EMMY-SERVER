const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// AUDITLOG SCHEMA -----------------------
const AuditLogSchema = Schema({
   dateCreated     : { type : Date, default : Date.now },
   message         : { type : String, required : true },
   user            : { type: Schema.Types.ObjectId, ref: 'User' }
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = {
   AuditLogSchema,
   AuditLog
}