var myApp = angular.module('myApp', ['ngRoute', 'ngMaterial', 'ngStorage']);

myApp.config(function($routeProvider, $mdIconProvider, $mdAriaProvider){

    $mdAriaProvider.disableWarnings();

    $routeProvider.when('/', {
        controller: 'LoginController',
        templateUrl: 'views/login.html'
    })
    .when('/api/poll', {
        controller: 'PollController',
        templateUrl: 'views/poll.html'
    })
    .when('/api/result', {
        controller: 'ResultController',
        templateUrl: 'views/poll_result.html'
    })
    .when('/api/questions', {
        controller: 'QuestionsController',
        templateUrl: 'views/questions.html'
    });
});



myApp.run(function($rootScope, $http, $location, $localStorage, $window){

    if($localStorage.currentUser){
        $http.defaults.headers.common.token = $localStorage.currentUser.token;
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current){
        var publicPages = ['/'];
        var restrictedPage = publicPages.indexOf($location.path()) === -1;

        if(restrictedPage && !$localStorage.currentUser){
            $location.path('/');
        }
    });

});