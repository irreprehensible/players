var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

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
			var d = {gameId:g.gameId,gamePlayers:g.gamePlayers,gameTime:13,err:''};
			resolve(d);
		})
		p.then(data=>{io.sockets.in(`game-${g.gameId}`).emit('joined', data);})
	});
	socket.on('playStarted', async function(gameId) { 
		let msg='Starting game...';
		io.sockets.in(`game-${gameId}`).emit('onWait',msg); //send wait for everyone in the game
		//GENERATE RANDOM ALPHABET
		let a = alphabets[Math.floor(Math.random()*alphabets.length)];
		//remove a
		alphabets.slice(alphabets.indexOf(a),1);
		let data={gameId:gameId,alphabet:a,alphabetArray:alphabets,gameStarted:true,gameStartedAt:Date.now(),gameTime:13};
		const p = new Promise((resolve,reject)=>{
			setTimeout(() => { // code to start game in Db
				var d = {gameId:data.gameId,alphabet:data.alphabet,alphabetArray:data.alphabetArray,gameTime:data.gameTime,err:''};
				resolve(d);
				//reject(d)
			}, 5000);
		});
		
		p.then((data)=>{
			io.sockets.in(`game-${gameId}`).emit('onStopWait',msg); //stop waiting for everyone in the game
			io.sockets.in(`game-${gameId}`).emit('onPlayStarted',data);
		})

	});
	socket.on('typing', function(val) { 
		val = val.split('~');
		socket.broadcast.to(`game-${val[0]}`).emit('onTyping', val);
	});
	socket.on('submit', function(data) { 
		io.sockets.in(`game-${data.gameId}`).emit('onSubmit', data);
		const p = new Promise((resolve,reject)=>{
			console.log(`submitted data - ${data}`);
			setTimeout(() => { // code to submite in Db
				var d = {gameId:data.gameId,playerId:data.playerId,err:''};
				resolve(d);
				//reject(d)
			}, 2000);
		});
		p.then(data=>{
			if(data.err!='')
				io.sockets.in(`game-${data.gameId}`).emit('onSaveError', data);
		})
	});

	socket.on('newPlay',function(gameId){
		let msg='next letter...';
		io.sockets.in(`game-${gameId}`).emit('onWait',msg); //send wait for everyone in the game
		//GENERATE RANDOM ALPHABET
		let a = alphabets[Math.floor(Math.random()*alphabets.length)];
		//remove a
		alphabets.slice(alphabets.indexOf(a),1);
		let data={gameId:gameId,alphabet:a,alphabetArray:alphabets,gameTime:13};
		const p = new Promise((resolve,reject)=>{
			setTimeout(() => { // code to start game in Db
				var d = {gameId:data.gameId,alphabet:data.alphabet,alphabetArray:data.alphabetArray,gameTime:data.gameTime,err:''};
				resolve(d);
				//reject(d)
			}, 3000);
		});
		
		p.then((data)=>{
			io.sockets.in(`game-${gameId}`).emit('onStopWait',msg); //stop waiting for everyone in the game
			io.sockets.in(`game-${gameId}`).emit('onNewPlay',data);
		})
	})
});

app.post('/join',(req,res)=>{
	let g = req.body
	return res.send(req.body);
})

server.listen(9000, function() {
  console.log('localhost:9000');
});