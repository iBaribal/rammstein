var mongoose = require('mongoose');

// Question Schema
var questionSchema = mongoose.Schema({
     question:{
        type: String,
        required: true
    },
    answer:{
        type:String,
        required: true
    },
    weight:{
        type:Number,
        required: true
    },
    selectedValue:{
        type:String,
        required: false
    }
});

var Question = module.exports = mongoose.model('Question', questionSchema);

// Get Questions
module.exports.getQuestions = function(callback, limit){
    Question.find(callback).limit(limit);
}
