var mongoose=require("mongoose");
//var Answer=require("./../models/answer.js");






var markSchema=new mongoose.Schema({
 
 
 Semester : Number,
 
 student : {
   id : {
     type : mongoose.Schema.Types.ObjectId ,
     ref : "User"
   },
   username : String
 },
 code : {
  type : String
 },
 merit : {
  type : Number
 },
 grade : {
  type : String
 }
 
});



module.exports= mongoose.model("Mark",markSchema);