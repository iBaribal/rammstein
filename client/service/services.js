
myApp.service('SongsService', function($http, $q){
    return {
        getAllSongs: function(){

            var deferred = $q.defer();

            $http.get('/api/songs')
                .then(
                    function(response){
                        deferred.resolve(response.data);
                    },
                    function(errResponse){
                        deferred.reject(errResponse);
                    }
                );
            return deferred.promise;
        },

        insertSongs: function(){

            var deferred = $q.defer();

            $http.post('/api/songs')
                .then(
                    function(response){
                        deferred.resolve(response.data);
                    },
                    function(errResponse){
                        deferred.reject(errResponse);
                    }
                );
            return deferred.promise;
        },

        save: function(result){
            var deferred = $q.defer();
            var username = result.username;

            $http.put('/api/saveResult/' + username, result).then(
                function(response){
                    deferred.resolve(response.data);
                },
                function(errResponse){
                    deferred.reject(errResponse);
                }
            );

            return deferred.promise;
        }
    }
});

myApp.service('LoginService', function($http, $q, $localStorage, $location){
    return {

        
        login: function(data){
            
            var deferred = $q.defer();
            
            $http.post('/api/authenticate', {name: data.name, password:data.password})
                .then(
                  function(response){
                      if(response.data.token){
                          $localStorage.currentUser = {username: data.name, token: response.data.token, hasVoted: response.data.hasVoted, admin: response.data.admin};
                          $http.defaults.headers.common.token = response.data.token;
                      }
                      deferred.resolve(response.data);
                  },
                  function(errResponse){
                      deferred.reject(errResponse);
                  }
                );
            return deferred.promise;
        },

        logout: function(){
            //remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.token = '';
            $location.path('/');
        }

        
    }
});

myApp.service('ResultService', function($http, $q){
    return{

        getAllResults: function(){

            var deferred = $q.defer();

            $http.get('/api/results').then(
                function(response){
                    deferred.resolve(response.data);
                },
                function(errResponse){
                    deferred.reject(errResponse);
                }
            );

            return deferred.promise;
        },

        getAllResults: function(){
            var deferred = $q.defer();
           
            $http.get('/api/results').then(
                function(response){
                    deferred.resolve(response.data);
                },
                function(errResopnse){
                    deferred.reject(errResopnse);
                }
            );
            return deferred.promise;
        },

        getResultByUsername: function(username){
            var deferred = $q.defer();
           
            $http.get('/api/result/' + username).then(
                function(response){
                    deferred.resolve(response.data);
                },
                function(errResopnse){
                    deferred.reject(errResopnse);
                }
            );
            return deferred.promise;
        },

        getActualResult: function(){
            var deferred = $q.defer();

            $http.get('/api/result/actualResult').then(
                function(response){
                    deferred.resolve(response.data);
                },
                function(errResopnse){
                    deferred.reject(errResopnse);
                }
            );
            return deferred.promise;
        },

        getGroupByCount: function(username){
            var deferred = $q.defer();
           
            $http.get('/api/groupByCount/' + username).then(
                function(response){
                    deferred.resolve(response.data);
                },
                function(errResopnse){
                    deferred.reject(errResopnse);
                }
            );
            return deferred.promise;
        }

    }
});

