var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.use(express.json());
io.sockets.on('connection', function(socket) {
	//socket.id=Math.random();
	console.log(`someone connected ${socket.id}`);
	
	socket.on('joinGame', function(g) { // is game id
		socket.join(`room-${g.gameId}`);
		console.log(g);
		io.sockets.in(`room-${g.gameId}`).emit('joined', g);
	});
	socket.on('typing', function(val) { 
		val = val.split('~');
		socket.broadcast.to(`room-${val[0]}`).emit('onTyping', val);
	});
	socket.on('playStarted', function(gameId) { 
		console.log(gameId);
		io.sockets.in(`room-${gameId}`).emit('onPlayStarted',gameId);
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