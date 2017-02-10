var mongoose = require('mongoose');

// Song Schema
var songSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    album:{
        type:String,
        required: true
    },
    weight:{
        type: Number,
        required: true
    }
});

var Song = module.exports = mongoose.model('Song', songSchema);

// Get Songs
module.exports.getSongs = function(callback, limit){
    Song.find(callback).limit(limit);
}
