var mongoose = require('mongoose');
var Song = require('./song');
var Question = require('./question');

// Result Schema
var resultSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    songs:{
        type: [Song.songSchema],
        required: true
    },
    questions:{
        type: [Question.questionSchema],
        required: true
    }
});

var Result = module.exports = mongoose.model('Result', resultSchema);

module.exports.saveResult = function(callback, limit){
    Result.save(function(err){
        if(err) throw err;

        console.log('Result saved successfully!');
    });
}

