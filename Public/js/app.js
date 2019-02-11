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
      var game = {gameId:`g-${i}sar${i}-dhde-343-dff${i}`,gameName:`${i}sardines${i}`,gamePic:'/images/pic.png',gamePlayers:0};
      $scope.games.push(game);
    }

    $scope.joinGame = function(id){
      let playerid = `P-${id.split('-')[1]}-${$scope.playerName}-pic-sff`;
      var player = {playerId:playerid,playerName:$scope.playerName,playerTyping:'',playerPic:'/images/pic.png'};
      let g = {gameId:id,player:player};
      socket.emit('joinGame', g);
      $('#hidGameId').val(id);
      $('#hidPlayerId').val(playerid)
      
      $http.post('/join',JSON.stringify(g))
      .then(function (result) {
        console.log(result);
      },
      function(error){
          alert(error.statusText);
          $scope.wait = false;
      });
    }
    socket.on('joined',function(g) {
      let p='';
      $.each($scope.players,function(i,v){
        if(!g.gamePlayers.includes(v)){
          p=v.playerName
        }
      });
      $('#divStatus').html(`${p} has joined`);
      $scope.players=g.gamePlayers;
    });

    $scope.typing = function(v){
      socket.emit('typing', `${$('#hidGameId').val()}~${$('#hidPlayerId').val()}~${v}`);
    }
    socket.on('onTyping',function(data){
      if($('#hidGameId').val() == data[0]){
        $.each($scope.players,function(i,v){
          if(v.playerId == data[1]){
            v.playerTyping = `typing ${data[2]}`
          }
        });
      }
    });

    $scope.gameStart = function(){
      socket.emit('playStarted', `${$('#hidGameId').val()}`);
    }
    socket.on('onPlayStarted',function(gameId){
      //change icon
      console.log('game start evt');
      if($('#hidGameId').val() == gameId){
        $('#btnGameStarted').hide();
        $('#gameTimer').show();
        $("#gameTimer").countdown({
          "seconds": 5,
          "warning-time": 3,
          "normal-class":"countdown-normal",
          "warning-class":"countdown-warning",
          "stop-class":"countdown-stop"
          });
      }  
      //start ticks 
      //set state in db to started
    });
});