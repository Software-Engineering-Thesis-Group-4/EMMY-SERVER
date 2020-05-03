const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ExtremeEmoSchema = Schema({

   negaEmoCnt     : { type : Number, default : 0 },
   employee       : { type : Schema.Types.ObjectId, ref: 'Employee', autopopulate: true },
   sentEmail      : { type : Boolean, default : false }
   
});

ExtremeEmoSchema.plugin(require('mongoose-autopopulate'));

const ExtremeEmo = mongoose.model('ExtremeEmotion', ExtremeEmoSchema);

module.exports = {
    ExtremeEmo,
    ExtremeEmoSchema
}