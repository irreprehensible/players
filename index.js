var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.use(express.json());

io.sockets.on('connection', function(socket) {
	console.log('someone connected');
	socket.on('joinGame', function(room) { // is game id
		socket.join(`room-${room}`);
	});
	socket.on('typing', function(val) { 
		val = val.split('~');
		io.sockets.in(`room-${val[0]}`).emit('onTyping', val);
	});
});
app.post('/join',(req,res)=>{
	let g = req.body
	io.sockets.in(`room-${g.gameId}`).emit('joined', `${g.playerName} has joined...`);
	return res.send(req.body);
})

server.listen(9000, function() {
  console.log('server up and running at 9000 port');
});