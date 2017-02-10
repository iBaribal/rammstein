var myApp = angular.module('myApp');

myApp.controller('PollController', function(ResultService, LoginService, SongsService, $scope, $http, $location, $routeParams, $mdDialog, $localStorage, $timeout){

    $scope.submitted = false;
    $scope.message = '';
    $scope.songs = [];
    $scope.actualSongs = [];
    $scope.myForm = {};

    $scope.selectedAlbum;
    $scope.maximumSongsSelect = 30;
    $scope.currentUser = $localStorage.currentUser.username;
    $scope.selectedSongs = [];    
    
    $scope.allResults = [];
    $scope.showResult = $localStorage.currentUser.hasVoted;

    var songSelection = [];
    var resultSongs = [];
    var resultQuestions = [];
    var actualResultSongTitle = [];
    var actualResultQuestionTitle = [];
    var maxAlbumsPlayed = [];

    var setlistAlbumCount = [];

    var maxAlbumsPlayed = []; 
    var actualMaxAlbumsPlayed = []; 

    var songsResultSum = 0;
    var questionResultSum = 0;
    var actualSongSum = 0;
    var actualQuestionsSum = 0;
    var maxSum = 0;

    // User Points Variables
    var totalSongs = 0;
    var albumCoverage = 0;
    var multiplier = 0.9;
    var currentTab = 0;

    $scope.isAdmin = $localStorage.currentUser.admin;

    $scope.selectedTabIndex = 0;

    var onTabChanges = $scope.$watch('selectedTabIndex',function(tabNumber){
        currentTab = tabNumber;
    });

    $scope.showAlert = function(ev){

        var help = '';
        if(currentTab == 0){
            help = 'Please Choose an Album and Songs from dropdown below. MIN Requirement 10 songs. MAX 30 songs.';
        }else if (currentTab == 1){
            help = 'Please Answer All questions. Each question gives 1 point if correct';
        }else help = '';

        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('HELP DIALOG')
                .textContent(help)
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                .targetEvent(ev)
        );
    };

    $scope.showPrerenderedDialog = function(ev) {
        $mdDialog.show({
        contentElement: '#myDialog',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
        });
    };
    

    var questions = [
        {
            "question":"What is the first song?",
            "answer": songSelection,
            "weight": 1,
            "selectedValue":""
        },
        {
            "question":"What is the last song?",
            "answer": songSelection,
            "weight": 1,
            "selectedValue":""
        },
        {
            "question":"Will song 'Ramm 4' be played?",
            "answer": ['Yes','No'],
            "weight": 1,
            "selectedValue":""
        },
        {
            "question":"How many songs till 'Till Hammer' (n-th song)",
            "answer":[1,2,3,4,5,'Later','Not doing it this time'],
            "weight": 1,
            "selectedValue":""
        },
        {
            "question":"Will Flake be tortured / bullied during live?",
            "answer": ['Yes','No'],
            "weight": 1,
            "selectedValue":""
        },
        {
            "question":"Will there be any new song? (excluding Ramm4)?",
            "answer": ['Yes','No'],
            "weight": 1,
            "selectedValue":""
        }
    ];

    $scope.isValid = function(){
        return $scope.selectedSongs.length > 5 && $scope.selectedSongs.length < 30 && $scope.myForm.$valid;
    }

    // update questions' answers when song selection changes
    var updateQuestions = $scope.$watch('selectedSongs', function(){
        
        songSelection = [];

        for(var i=0; i < $scope.selectedSongs.length; i++){
            songSelection[i] = $scope.selectedSongs[i].title;
        }
        $scope.questions[0].answer = songSelection;
        $scope.questions[1].answer = songSelection;
        $scope.questions = questions;
    });

    var update = function(){
        $scope.questions[0].answer = songSelection;
        $scope.questions[1].answer = songSelection;
        $scope.questions = questions;
    };

    $scope.questions = questions;

    $scope.albums = ['Herzeleid', 'Sehnsucht', 'Mutter', 'Reise Reise', 'Rosenrot', 'Liebe Ist Für Alle Da', 'RARE TRACKS 1994-2012'];

    var getSongs = function(){
        SongsService.getAllSongs().then(
            function(response){
                $scope.songs = response;
            },
            function(errResponse){
                console.log('Error while fetching songs from server...');
            }
        );
    };

    var allResults = [];

    var getAllResults = function(){

        var result = {username:'',songs:[], questions:[]};

        ResultService.getAllResults().then(
            function(response){
                
                for(var i=0; i<response.length; i++){
                    result.username = response[i].username;
                    result.songs.push(response[i].songs);
                    result.questions.push(response[i].questions);

                    allResults.push(result);
                }
               
            },
            function(errResponse){
                console.log('Error fetching all results...');
            }

        );
    };


    var compareSongResult = function(result){

        var allResult = {username: '', songSum: 0, questionSum: 0, bonusSum: 0};
        
        allResult.username = result.username;

        
        // get sum of songs' points
        for(var i=0; i<result.songs.length; i++){
            if(actualResultSongTitle.indexOf(result.songs[i].title) !== -1){  
                allResult.songSum += result.songs[i].weight;
            }
        }

        // get sum of questions' points
        for(var i=0; i<result.questions.length; i++){
            if(actualResultQuestionTitle[i] == result.questions[i].selectedValue){  
                allResult.questionSum += result.questions[i].weight;
            }
        }
       
    };
    
    var getResultByUsername = function(){
        ResultService.getResultByUsername($localStorage.currentUser.username).then(
            function(response){
                $scope.result = response;
                

                // calculate user correct songs score
                for(var i=0; i<$scope.result.songs.length; i++){
                    if(actualResultSongTitle.indexOf($scope.result.songs[i].title) !== -1){
                        songsResultSum += $scope.result.songs[i].weight;
                    }
                }

                // calculate user correct questions score
                
                for(var i=0; i<$scope.result.questions.length; i++){
                    if(actualResultQuestionTitle[i] == $scope.result.questions[i].selectedValue){
                        questionResultSum += $scope.result.questions[i].weight;
                    }
                }

                // @@calculate hidden Points
               

                // display score
                $scope.songsResultSum = songsResultSum;
                $scope.questionResultSum = questionResultSum;
                $scope.sum = songsResultSum + questionResultSum - calculatePenalty($scope.result.songs);

            },
            function(errResponse){
                $scope.showResult = false;
                console.log('error fetching data by username -> ' + $localStorage.currentUser.username);
            }
        );

    };

    var getActualResult = function(){
        ResultService.getActualResult().then(
            function(response){
                

                for(var i=0; i<response.songs.length; i++){
                    actualResultSongTitle.push(response.songs[i].title);
                    actualSongSum += response.songs[i].weight;
                }

                for(var i=0; i<response.questions.length; i++){
                    actualResultQuestionTitle.push(response.questions[i].selectedValue);
                    maxSum += response.questions[i].weight;
                    actualQuestionsSum += response.questions[i].weight;
                }

                $scope.actualResult = response;

                $scope.actualSongSum = actualSongSum;
                $scope.actualQuestionsSum = actualQuestionsSum;
                
                $scope.maxSum = actualQuestionsSum + actualSongSum;
            },
            function(errResponse){
                console.log('actual result not available');
            }
        );
    };

    

    var sum = 0;

    $scope.exists = function(object, type){


        if(type == 'song'){
            if(actualResultSongTitle.indexOf(object.title) !== -1){
 
                return true;
            }
        }

        if(type == 'question'){

            for(var i=0; i<actualResultQuestionTitle.length; i++){
                if($scope.result.questions[object].selectedValue == actualResultQuestionTitle[object]){
                    return true;
                }
            }
            
        }

        if(type == 'album'){
            for(var i=0; i<actualMaxAlbumsPlayed.length; i++){
                if(actualMaxAlbumsPlayed[i]._id.indexOf(object._id) !== -1){
 
                    return true;
                }
            }
            
        }
        
    };

    $scope.remove = function(index){


        $scope.selectedSongs.splice(index, 1);
        songSelection = [];

        for(var i=0; i < $scope.selectedSongs.length; i++){
            songSelection[i] = $scope.selectedSongs[i].title;
        }

        update();
    }

    announceClick = function(album){
        console.log(album);
    }
    
    var insertSongs = function(){
        SongsService.insertSongs().then(
            function(response){
                console.log('inserted!');
            },
            function(errResponse){
                console.log('error inserting songs');
            }
        );
    };


    $scope.logout = function(){
      LoginService.logout();
    };

    $scope.save = function(){

       $scope.submitted = true;

        var result = {
            username: $localStorage.currentUser.username,
            songs: $scope.selectedSongs,
            questions:questions
        };

        SongsService.save(result).then(
            function(response){
                $timeout(function(){
                    $scope.submitted = false;
                    $scope.message = 'Thank You for Respose! You will be logged out now...';
                    var hasVoted = true;
                    LoginService.logout();
                },2000);
                
            },
            function(errResponse){
                console.log('error!');
            }
        );


       
    };

    /** ----------------------------- update 2/7/2017 --------------------------------------------- */

    var calculateQuestionsSum = function(questions){

        var sum = 0;

        if($scope.actualResult !== undefined){
            for(var i=0; i<questions.length; i++){
                if(questions[i].selectedValue == $scope.actualResult.questions[i].selectedValue){
                    sum += $scope.actualResult.questions[i].weight;
                }
            }
        }
       
        return sum;

    };

    var calculateSongsSum = function(songs){

        var sum = 0;
        if($scope.actualResult !== undefined){
            for(var i=0; i<songs.length; i++){

                if(actualResultSongTitle.indexOf(songs[i].title) !== -1){
                    sum += songs[i].weight;
                }
            }
        }
        return sum;

    };

    var calculatePenalty = function(songs){
        if($scope.actualResult !== undefined){
            if($scope.actualResult !== undefined){
                return Math.abs($scope.actualResult.songs.length - songs.length);
            }
        }
    };


    var calculateBonus = function(songs){
        
        if($scope.actualResult !== undefined){
            var x = $scope.actualResult.songs.length;
            var y = songs.length;

            return x == y ? 2:0;
        }else return 0;
    };

    var vm = this;

    var generateFinalResult = function(){


        // get Songs
        ResultService.getAllResults().then(
            function(response){
                
                
                var allPoints = [];
                for(var i=0; i<response.length; i++){



                    var points = {username:'',songsSum:0, questionsSum:0, bonus: 0, penalty:0, total:0};

                    points.username = response[i].username;
                    

                    if(points.username !== 'actualResult'){
                        points.songsSum = calculateSongsSum(response[i].songs);
                        points.questionsSum = calculateQuestionsSum(response[i].questions);
                        points.penalty = calculatePenalty(response[i].songs);
                        points.bonus = calculateBonus(response[i].songs);
                        points.total = points.songsSum + points.questionsSum - points.penalty + points.bonus;
                        allPoints.push(points);
                    }
                    
                }
                //console.log(allPoints);
                $scope.allPoints = allPoints;

            },
            function(errResponse){
                console.log('Error fetching all results...');
            }
        );
    };

    getActualResult();
    getSongs();
    getResultByUsername();
    generateFinalResult();
    
})
.controller('QuestionsController', ['$scope', function($scope){
    $scope.title = "This is questions controller";
}])
.controller('LoginController', function($scope, $http, $location, $routeParams, $mdDialog, LoginService){

    
    $scope.vm = {
      formData: {
        email: '',
       	password: ''
      }
    };

  $scope.login = function(){

      var credentials = {
         name:$scope.vm.formData.email,
         password:$scope.vm.formData.password
      }
     


      LoginService.login(credentials).then(
          function(response){
              if(response.success = true){
                  console.log(response);
                  $location.path('/api/poll');
              }else{
                  console.log('username or password incorrect!');
              }
          },
          function(errResponse){
              console.log('error getting login data');
          }
      );
  };

});