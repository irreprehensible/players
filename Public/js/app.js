var app = angular.module('app', ['timer']);

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
    $scope.playingGame = {
      name:'',
      place:'',
      animal:'',
      thing:'',
      namePoints:0,
      placePoints:0,
      animalPoints:0,
      thingPoints:0,
    }
    // $scope.playingGame.namePoints=0;
    // $scope.playingGame.placePoints=0;
    // $scope.playingGame.animalPoints=0;
    // $scope.playingGame.thingPoints=0;
    $scope.playerTime=0;
    $scope.gameTime=180;
    $scope.wait=false;
    $scope.loaderMsg='loading...'
    for(var i=1;i<3;i++){
      var game = {gameId:`g-${i}sar${i}-dhde-343-dff${i}`,gameName:`${i}sardines${i}`,gamePic:'/images/pic.png',gamePlayers:0};
      $scope.games.push(game);
    }

    socket.on('onWait',function(msg){
      if(msg){$scope.loaderMsg=msg}
      $scope.wait=true;
    });
    socket.on('onStopWait',function(data){
      $scope.wait=false;
    })

    $scope.joinGame = function(id){
      $scope.wait=true;
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
        if(!data.gamePlayers.includes(v)){
          p=v.playerName
        }
      });
      $scope.wait=false;
      $('#divStatus').html(`${p} has joined`);
      $scope.players=data.gamePlayers;
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
          $scope.$broadcast('timer-set-countdown',data.gameTime);
          $scope.$broadcast('timer-start');
        }  
      }
    });

    $scope.$on('timer-stopped', function (event, data){
      //console.log('Timer Stopped - data = ', data);
      $scope.playerTime =data.seconds;
      if(data.seconds==0) //update only if not submitted
        $scope.updateGame();
    });
    socket.on('onSubmit',function(data){
      let c=0;
      $.each($scope.players,function(i,v){
        if(v.playerId == data.playerId){
          v.playerTyping = `sub`
        }
        if(v.playerTyping==sub)
          c++;
      });
      if($scope.players.length==c){
        //everyone has submitted so 
        socket.emit('newPlay', data.gameId);
      }
      $scope.wait=false;
      $scope.loaderMsg='loading...';
    });
    $scope.updateGame = function(){ //submit
      $scope.$broadcast('timer-stop');
      $scope.loaderMsg='submitting...'
      $scope.wait=true;
      let wordsArray={
        name:`${$scope.playingGame.name}-${$scope.playingGame.namePoints}`,
        place:`${$scope.playingGame.place}-${$scope.playingGame.placePoints}`,
        animal:`${$scope.playingGame.animal}-${$scope.playingGame.animalPoints}`,
        thing:`${$scope.playingGame.thing}-${$scope.playingGame.thingPoints}`,
      }
      let submitObj={
        gameId:$('#hidGameId').val(),
        playerId:$('#hidPlayerId').val(),
        words:wordsArray,
        playerTime:$scope.playerTime
      }
      socket.emit('submit', submitObj);
    }

    socket.on('onNewPlay',function(data){
      $.each($scope.players,function(i,v){
        v.playerTyping='';
      });
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
          $scope.$broadcast('timer-reset');
          $scope.$broadcast('timer-set-countdown',data.gameTime);
          $scope.$broadcast('timer-start');
        }  
      }
    });
});