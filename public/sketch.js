let users = {};
let socket, socketId;

let position;

let cnv;
let nameInput;

let clicked = false;

function setup() {
	cnv = createCanvas(800, 800);
	cnv.x = cnv.position().x;
	cnv.y = cnv.position().y;
	
	nameInput = createInput("");
	nameInput.position(cnv.x, cnv.y-23);
	nameInput.size(200);
	
	socket = io.connect();
	
	socket.on('users',
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
	
	socket.on('sendName',
		function(data)
		{
			users[data.id].name = data.name;
		}
	);
	
	socket.on('hit',
		function(data)
		{
			users[data].health -= 10;
		}
	);
}

function draw() {
	background(100);
	
	noStroke();
	fill(255);
	
	var index = 0;
	for(id in users)
	{
		var p = users[id];
		
		circle(p.pos.x, p.pos.y, 20);
		text(p.name, 5, 15 + index*20);
		
		rect(p.pos.x - 20, p.pos.y + 15, p.health/100*40, 10);
		
		index++;
	}
	
	if(clicked)
	{
		stroke(0);
		strokeWeight(3);
		
		var p = users[socketId];
		
		var angle = createVector(mouseX - p.pos.x, mouseY - p.pos.y).heading();
		var x = p.pos.x + cos(angle)* 1132;
		var y = p.pos.y + sin(angle)* 1132;
		
		line(p.pos.x, p.pos.y, x, y);
		
		for(id in users)
		{
			if(id != socketId)
			{
				var op = users[id];
				
				if(lineCircle(p.pos.x, p.pos.y, x, y, op.pos.x, op.pos.y, 10))
				{
					socket.emit('hit', id);
					users[id].health -= 10;
				}
			}
		}
		
		clicked = false;
	}
	
	if(socketId)
	{
		var x = keyIsDown(68) - keyIsDown(65);
		var y = keyIsDown(83) - (keyIsDown(90) || keyIsDown(87));
		
		if(x || y)
		{
			var p = users[socketId];
			p.pos.x += x*5;
			p.pos.y += y*5;
			
			socket.emit('position', p.pos);
		}
	}
}

function mousePressed()
{
	clicked = true;
}

function keyPressed()
{
	if(keyCode == ENTER)
	{
		users[socketId].name = nameInput.value();
		
		socket.emit('sendName', nameInput.value());
	}
}

function lineCircle(x1, y1, x2, y2, cx, cy, r)
{
	var dx = x2 - x1;
	var dy = y2 - y1;
	
	var fx = x1 - cx;
	var fy = y1 - cy;
	
	var a = dx*dx + dy*dy;
	var b = 2 * (fx*dx + fy*dy);
	var c = (fx*fx + fy*fy) - r*r;
	
	var discriminant = b*b - 4*a*c;
	
	if(discriminant > 0)
	{
		discriminant = sqrt(discriminant);
		
		var t1 = (-b - discriminant)/(2*a);
		var t2 = (-b + discriminant)/(2*a);
		
		if(t1 >= 0 && t1 <= 1)
			return true; // -o-> and -|-> |
			
		if(t2 >= 0 && t2 <= 1)
			return true; // | -|->
	}
	return false;
}