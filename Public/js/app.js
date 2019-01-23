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

  

  app.controller('MainCtrl', function($scope,$http, socket) {
    $scope.games = [];
    $scope.players=[];

    for(var i=1;i<3;i++){
      var game = {gameId:`gam-${i}sar${i}-dede-343434343-dff${i}`,gameName:`${i}sardines${i}`,gamePic:'/images/pic.png',gamePlayers:0};
      $scope.games.push(game);
    }
    $scope.joinGame = function(id){
      socket.emit('joinGame', id);
      socket.on('joined',function(data) {
        $('#divStatus').html(data);
      });
      let playerid = `PLA-${id.split('-')[1]}-${Date.now()}-sff`;
      var player = {playerId:playerid,playerName:$scope.playerName,playerTyping:'',playerPic:'/images/pic.png'};
      $scope.players.push(player);
      $('#hidGameId').val(id);
      $('#hidPlayerId').val(playerid)
      let g = {gameId:id,playerId:playerid,playerName:$scope.playerName};
      $http.post('/join',JSON.stringify(g))
      .then(function (result) {
        
        console.log(result);
      },
      function(error){
          alert(error.statusText);
          $scope.wait = false;
      });
    }

    $scope.typing = function(){
      socket.emit('typing', `${$('#hidGameId').val()}~${$('#hidPlayerId').val()}~name`);
      socket.on('onTyping',function(data){
        if($('#hidGameId').val() == data[0]){
          $.each($scope.players,function(i,v){
            if(v.playerId == data[1]){
              v.playerTyping = `typing ${data[2]}`
            }
          });
        }
      })
    }
});