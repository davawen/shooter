let users = {};
let socket, socketId;

let position;

let nameInput;

function setup() {
	createCanvas(800, 800);
	
	
	
	socket = io.connect();
	
	socket.on('newConnection',
		function(data)
		{
			users = data;
			
			socketId = socket.id;
		}
	);
	
	socket.on('position',
		function(data)
		{
			users[data.id].pos = data.pos;
		}
	);
}

function draw() {
	background(100);
	
	noStroke();
	fill(255);
	
	//circle(position.x, position.y, 20);
	for(id in users)
	{
		var p = users[id];
		
		circle(p.pos.x, p.pos.y, 20);
	}
	
	//#region Logic
	
	if(socketId)
	{
		var x = keyIsDown(68) - keyIsDown(65);
		var y = keyIsDown(83) - (keyIsDown(90) || keyIsDown(87));
		
		var p = users[socketId];
		p.pos.x += x*5;
		p.pos.y += y*5;
		
		socket.emit('position', p.pos);
	}
	
	//#endregion
}