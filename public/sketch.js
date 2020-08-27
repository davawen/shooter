let users = {};
let socket;

let position;

let cnv;
let nameInput;

let reload = 5;

let map;

function preload()
{
	map = loadJSON('maps/map.json');
}

function setup()
{
	map = Object.values(map);
	
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
		}
	);
	
	socket.on('position',
		function(data)
		{
			users[data[0]].pos = data[1];
		}
	);
	
	socket.on('sendName',
		function(data)
		{
			users[data[0]].name = data[1];
		}
	);
	
	socket.on('hit',
		function(data)
		{
			users[data].health -= 10;
		}
	);
	
	socket.on('death',
		function(data)
		{
			var u = users[data[0]];

			u.pos.x = 400;
			u.pos.y = 400;
			u.health = 100;

			u.deaths++;
			users[data[1]].kills++;
		}
	);
}

function draw()
{
	background(100);
	
	noStroke();
	fill(255);
	textSize(16)
	
	map.forEach(
		function (o)
		{
			rect(o.x, o.y, o.w, o.h);
		}
	);
	
	var index = 0;
	for(id in users)
	{
		var p = users[id];
		
		circle(p.pos.x, p.pos.y, 20);
		text(p.name, 5, 15 + index*20);
		
		fill(0);
		rect(p.pos.x - 20, p.pos.y + 15, 40, 10);
		
		fill(255);
		rect(p.pos.x - 20, p.pos.y + 15, p.health/100 * 40, 10);
		
		index++;
	}
	
	if(reload > 0) reload--;
	else if(mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)
	{
		strokeWeight(3);
		
		var p = users[socket.id];
		
		var angle = createVector(mouseX - p.pos.x, mouseY - p.pos.y).heading();
		var x = p.pos.x + cos(angle)* 1132;
		var y = p.pos.y + sin(angle)* 1132;
		
		stroke(0);
		for(i = 0; i < map.length; i++)
		{
			var o = map[i];
			
			if(!lineRect(p.pos.x, p.pos.y, x, y, o)) continue;
			
			stroke(255, 0, 0);
			break;
		}
		
		line(p.pos.x, p.pos.y, x, y);
		
		for(id in users)
		{
			if(id != socket.id)
			{
				var op = users[id];
				
				if(lineCircle(p.pos.x, p.pos.y, x, y, op.pos.x, op.pos.y, 10))
				{
					socket.emit('hit', id);
					users[id].health -= 10;
				}
			}
		}
		
		reload = 0;
	}
	
	var p = users[socket.id];
	if(p)
	{
		var x = keyIsDown(68) - keyIsDown(65);
		var y = keyIsDown(83) - (keyIsDown(90) || keyIsDown(87));
		
		if(x || y)
		{
			
			p.pos.x += x*5;
			p.pos.y += y*5;
			
			socket.emit('position', p.pos);
		}	
	}
	
	var scoreboard = keyIsDown(222);
	
	if(scoreboard)
	{
		textAlign(LEFT, TOP);
		noStroke();
		
		var length = index;
		index = 0;
		
		var str, w;
		for(id in users)
		{
			p = users[id];
			
			var _y = height/2 + (index - length/2)*30;
			
			str = p.name + " - " + p.kills + " / " + p.deaths;
			w = textWidth(str);
			
			fill(255, 160);
			rect(width/2 - w/2 - 5, _y, w+10, 30);
			
			fill(0);
			text(str, width/2 - w/2, _y+7);
			
			index++;
		}
	}
}

function setName(name)
{
	users[socket.id].name = name;
	socket.emit('sendName', name);
}

function keyPressed()
{
	if(keyCode == ENTER)
		setName(nameInput.value());
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
			return true; // -|--|-> or -|-> |
			
		if(t2 >= 0 && t2 <= 1)
			return true; // | -|->
	}
	return false;
}

function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

	// calculate the direction of the lines
	var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
	var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

	// if uA and uB are between 0-1, lines are colliding
	
	return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
	
	//Calculate position
	/*if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1)
	{

		// optionally, draw a circle where the lines meet
		var intersectionX = x1 + (uA * (x2 - x1));
		var intersectionY = y1 + (uA * (y2 - y1));
		fill(255, 0, 0);
		noStroke();
		ellipse(intersectionX, intersectionY, 20, 20);

		return true;
	}
	return false;*/
}

function lineRect(x1, y1, x2, y2, r) {
	
	var left = lineLine(x1, y1, x2, y2, r.x, r.y, r.x, r.y + r.h);
	if(left) return true;
	
	var right = lineLine(x1, y1, x2, y2, r.x + r.w, r.y, r.x + r.w, r.y + r.h);
	if(right) return true;
	
	var top = lineLine(x1, y1, x2, y2, r.x, r.y, r.x + r.w, r.y);
	if(top) return true;
	
	var bottom = lineLine(x1, y1, x2, y2, r.x, r.y + r.h, r.x + r.w, r.y + r.h);
	return bottom;
}