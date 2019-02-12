var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Q = require('q');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
let games=[];
let alphabets=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
for(var i=1;i<3;i++){
	var game = {gameId:`g-${i}sar${i}-dhde-343-dff${i}`,gameName:`${i}sardines${i}`,gamePic:'/images/pic.png',gamePlayers:[]};
	games.push(game);
  }
io.sockets.on('connection', function(socket) {
	//socket.id=Math.random();
	console.log(`someone connected ${socket.id}`);
	
	socket.on('joinGame', function(g) { // is game id
		socket.join(`game-${g.gameId}`);
		const p = new Promise((resolve,reject)=>{
			games.forEach(el => { //miomics db operation
				if(el.gameId == g.gameId){
					el.gamePlayers.push(g.player);
					g=el;
				}
			});
			var d = {g:g,err:''};
			resolve(d);
		})
		p.then(data=>{io.sockets.in(`game-${g.gameId}`).emit('joined', data);})
	});
	socket.on('playStarted', async function(gameId) { 
		//GENERATE RANDOM ALPHABET
		let a = alphabets[Math.floor(Math.random()*alphabets.length)];
		//remove a
		alphabets.slice(alphabets.indexOf(a),1);
		let data={gameId :gameId,alphabet:a,gameStarted:true,gameStartedAt:Date.now(),gameTime:30};
		const p = new Promise((resolve,reject)=>{
			setTimeout(() => { // code to start game in Db
				var d = {gameId:data.gameId,alphabet:data.alphabet,gameTime:data.gameTime,err:''};
				resolve(d);
				//reject(d)
			}, 5000);
		});
		p.then((data)=>{io.sockets.in(`game-${gameId}`).emit('onPlayStarted',data);})

	});
	socket.on('typing', function(val) { 
		val = val.split('~');
		socket.broadcast.to(`game-${val[0]}`).emit('onTyping', val);
	});
	socket.on('submit', function(val) { 
		val = val.split('~');
		socket.broadcast.to(`game-${val[0]}`).emit('onSubmit', val[1]);
	});
});

app.post('/join',(req,res)=>{
	let g = req.body
	return res.send(req.body);
})

server.listen(9000, function() {
  console.log('localhost:9000');
});