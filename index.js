var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function(socket) {
	console.log('someone connected');
});

server.listen(9000, function() {
  console.log('server up and running at 9000 port');
});