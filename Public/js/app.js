var app = angular.module('app', [  ]);

  app.factory('socket', function($rootScope) {
    var socket = io.connect();
    return {
      on: function(eventName, callback) {
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if(callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  });

  

  app.controller('MainCtrl', function($scope, socket) {
    $scope.games = [];
    $scope.players=[];

    for(var i=1;i<3;i++){
      var game = {gameId:`gam-${i}sar${i}-dede-343434343-dff${i}`,gameName:`${i}sardines${i}`,gamePic:'/images/pic.png',gamePlayers:0};
      $scope.games.push(game);
    }
  });