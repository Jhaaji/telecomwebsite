var mongoose=require("mongoose");



var moment = require('moment-timezone');
var dateThailand = moment.tz(Date.now(), "Asia/Bangkok");


var answerSchema=new mongoose.Schema({
 
 text : String,
 
 author : {
   id : {
     type : mongoose.Schema.Types.ObjectId,
     ref : "User"
   },
   username : String
 },
 
 posted_at: {type : Date, default : dateThailand},
 
 likes_count: {type : Number, default : 5 }

});

module.exports= mongoose.model("Answer",answerSchema);