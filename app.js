var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');

var port = process.env.port || 3000;

var jwt = require('jsonwebtoken');
var config = require('./config');

var User = require('./models/user');
var Result = require('./models/result');
var Song = require('./models/song');
var Question = require('./models/question');

var apiRoutes = express.Router();

app.use(express.static(__dirname + '/client'));
//app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.set('views', path.join(__dirname,'client'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



//Connect to mongoose
mongoose.connect('mongodb://fred:fred@ds111549.mlab.com:11549/rammstein', ['users','songs', 'results']);
app.set('superSecret', config.secret);

app.use(morgan('dev'));

var db = mongoose.connection;



apiRoutes.post('/authenticate', function(req, res) {


  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440*60 // expires in 24 hours
        });
        console.log(user);
        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token,
          hasVoted: user.hasVoted,
          admin: user.admin
        });
      }   

    }
  });
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        res.json({ success: false, message: 'Failed to authenticate token.' });
        //res.redirect('/')    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------



app.get('/', function(req, res) {

    
    res.render('index.html');
});

apiRoutes.get('/songs', function(req, res){

    Song.getSongs(function(err, songs){
        if(err){
            throw err;
        }
        res.json(songs);
    });
});

apiRoutes.put('/saveResult/:username', function(req, res){


  var result = new Result();

  for(var song in req.body.songs){ 
    result.songs.push(new Song(req.body.songs[song]));
  }

  for(var q in req.body.questions){
    //result.questions.push(new Question(req.body.questions[question]));
    result.questions.push(new Question(req.body.questions[q]));
  }

  result.username = req.body.username;
  
  User.findOneAndUpdate({'name':req.params.username},{$set:{hasVoted:true}}, function(err, result){
      console.log(req.params.username);
      console.log('hasVoted');
  });

  Result.findOneAndUpdate({'username':req.params.username},{$set:{songs:result.songs,questions:result.questions}},{upsert:true}, function(err, result){
      res.json(result);
  });

});



apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

apiRoutes.get('/check', function(req, res) {
	res.json(req.decoded);
});

apiRoutes.get('/results', function(req, res){
  Result.find({}, function(err, results){
    //console.log(results);
    res.json(results);
  });
});

apiRoutes.get('/result/:username', function(req,res){

  Result.findOne({username: req.params.username}, function(err, result){
     if(err){
       throw err;
     }

     if(!result){
       return;
     }

     res.json(result);
  });
});



apiRoutes.get('/groupByCount/:username', function(req,res){

  var agg = [
    { $match: {'username': req.params.username}},
    { $unwind: '$songs'},
    { $group: {
      _id: '$songs.album',
      count: {$sum: 1},
    }},
    
  ];
   

Result.aggregate(agg, function(err,result){
     if(err){
       throw err;
     }
     //console.log(result)
     res.json(result);
  });

});


apiRoutes.get('/result/actualResult', function(req, res){

  Result.findOne({username: 'actualResult'}, function(err, result){
    console.log(result);
    res.json(result);
  });
});


apiRoutes.post('/saveResult', function(req, res){

  var result = new Result();

  for(var song in req.body.songs){ 
    result.songs.push(new Song(req.body.songs[song]));
  }

  for(var q in req.body.questions){
    //result.questions.push(new Question(req.body.questions[question]));
    result.questions.push(new Question(req.body.questions[q]));
  }

  result.username = req.body.username;

  

  result.save(function(err,data){
    res.json(data);
  });
  
});

app.use('/api', apiRoutes);

app.listen(process.env.PORT);
console.log('Running server on port '+process.env.PORT+'...');