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
    $scope.alphabet='...';
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
    }
    socket.on('joined',function(data) {
      let p='';
      $.each($scope.players,function(i,v){
        if(!data.g.gamePlayers.includes(v)){
          p=v.playerName
        }
      });
      $('#divStatus').html(`${p} has joined`);
      $scope.players=data.g.gamePlayers;
    });

    $scope.typing = function(v){
      socket.emit('typing', `${$('#hidGameId').val()}~${$('#hidPlayerId').val()}~${v}`);
    }
    socket.on('onTyping',function(data){
      //if($('#hidGameId').val() == data[0]){
        $.each($scope.players,function(i,v){
          if(v.playerId == data[1]){
            v.playerTyping = `typing ${data[2]}`
          }
        });
      //}
    });

    $scope.gameStart = function(){
      socket.emit('playStarted', `${$('#hidGameId').val()}`);
    }
    socket.on('onPlayStarted',function(data){
      if(data.err!=''){
        console.log('game start err');
        alert('Some error occured while starting the game\n please try again');
      }
      else{
        //change icon
        $scope.alphabet = data.alphabet;
        console.log('game start evt');
        if($('#hidGameId').val() == data.gameId){
          $('#btnGameStarted').hide();
          $('#gameTimer').show();
          $("#gameTimer").countdown({
            "seconds": data.gameTime,
            "warning-time": 5,
            "normal-class":"countdown-normal",
            "warning-class":"countdown-warning",
            "stop-class":"countdown-stop",
            "warning-text":"submit NOW!!"
            });
        }  
     }
    });
    socket.on('onSubmit',function(playerId){
      //if($('#hidGameId').val() == data[0]){
        $.each($scope.players,function(i,v){
          if(v.playerId == playerId){
            v.playerTyping = `sub`
          }
        });
      //}
    });
    
    $scope.updateGame = function(){
      socket.emit('submit', `${$('#hidGameId').val()}~${$('#hidPlayerId').val()}`);
    }
});