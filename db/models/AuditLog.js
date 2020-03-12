const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// AUDITLOG SCHEMA -----------------------
const AuditLogSchema = Schema({
   date: Date,
   message: String,
   user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   }
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = {
   AuditLogSchema,
   AuditLog
}