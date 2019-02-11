var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.use(express.json());
let games=[];
for(var i=1;i<3;i++){
	var game = {gameId:`g-${i}sar${i}-dhde-343-dff${i}`,gameName:`${i}sardines${i}`,gamePic:'/images/pic.png',gamePlayers:[]};
	games.push(game);
  }
io.sockets.on('connection', function(socket) {
	//socket.id=Math.random();
	console.log(`someone connected ${socket.id}`);
	
	socket.on('joinGame', function(g) { // is game id
		socket.join(`game-${g.gameId}`);
		games.forEach(el => {
			if(el.gameId == g.gameId){
				el.gamePlayers.push(g.player);
				g=el;
			}
		});
		console.log(g);
		io.sockets.in(`game-${g.gameId}`).emit('joined', g);
	});
	socket.on('typing', function(val) { 
		val = val.split('~');
		socket.broadcast.to(`game-${val[0]}`).emit('onTyping', val);
	});
	socket.on('playStarted', function(gameId) { 
		console.log(gameId);
		io.sockets.in(`game-${gameId}`).emit('onPlayStarted',gameId);
		console.log(gameId);
	});
});
app.post('/join',(req,res)=>{
	let g = req.body
	return res.send(req.body);
})

server.listen(9000, function() {
  console.log('localhost:9000');
});