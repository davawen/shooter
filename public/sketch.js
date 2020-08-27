let users = {};
let socket;

let position;

let cnv;
let nameInput;

let visibility = true;

let reloading = 0;
let reload = 5;
let ammo = 30;

let weapon;

let map, weapons;

let crosshair, shootSound;

function preload()
{
	map = loadJSON('settings/map.json');
	weapons = loadJSON('settings/weapons.json');
	
	crosshair = loadImage('media/crosshair.png');
	shootSound = loadSound('media/shoot.wav');
	
}

function setup()
{
	map = Object.values(map);
	weapons = Object.values(weapons);
	
	shootSound.setVolume(0.2);
	
	
	weapon = weapons[0];
	
	cnv = createCanvas(800, 800);
	cnv.x = cnv.position().x;
	cnv.y = cnv.position().y;
	
	nameInput = createInput("");
	nameInput.position(cnv.x, cnv.y-23);
	nameInput.size(200);
	
	noCursor();
	
	//#region Networking
	
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
	
	socket.on('angle',
		function(data)
		{
			users[data[0]].angle = data[1];
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
	
	//#endregion
}

function draw()
{
	background(100);
	
	noStroke();
	fill(255);
	textSize(16)

	map.forEach(
		function (_r)
		{
			rect(_r.x, _r.y, _r.w, _r.h);
		}
	);
	
	var p = users[socket.id];
	
	if(p)
	{
		var _x = keyIsDown(68) - keyIsDown(65);
		var _y = keyIsDown(83) - (keyIsDown(90) || keyIsDown(87));

		if (_x || _y)
		{
			_x = p.pos.x + _x * 5 - 10;
			_y = p.pos.y + _y * 5 - 10;
			
			var _colx = false;
			var _coly = false;
			
			for(i = 0; i < map.length; i++)
			{
				if(rectRect(_x, p.pos.y - 10, 20, 20, map[i]))
				{
					_colx = true;
					break;
				}
			}
			
			for(i = 0; i < map.length; i++)
			{
				if (rectRect(p.pos.x - 10, _y, 20, 20, map[i]))
				{
					_coly = true;
					break;
				}
			}
			
			if(!_colx)
				p.pos.x = _x + 10;
			if(!_coly)
				p.pos.y = _y + 10;
			
			socket.emit('position', p.pos);
		}
		
		var angle = createVector(mouseX - p.pos.x, mouseY - p.pos.y).heading();
		var x = cos(angle);
		var y = sin(angle);
		
		p.angle = angle;
		socket.emit('angle', angle);
	}
	
	textAlign(LEFT, TOP);
	ellipseMode(RADIUS);
	var index = 0;
	for(id in users)
	{
		var op = users[id];
		
		stroke(0);
		strokeWeight(3);
		line(op.pos.x, op.pos.y, op.pos.x + cos(op.angle) * 15, op.pos.y + sin(op.angle) * 15);

		noStroke();
		circle(op.pos.x, op.pos.y, 10);
		text(op.name, 5, 15 + index*20);
		
		strokeWeight(1);
		stroke(0);
		fill(0);
		rect(op.pos.x - 20, op.pos.y + 15, 40, 10);
		
		fill(255);
		rect(op.pos.x - 20, op.pos.y + 15, op.health/100 * 40, 10);
		
		textAlign(CENTER, BOTTOM);
		textSize(16);
		text(op.name, op.pos.x, op.pos.y - 15);
		
		index++;
	}
	
	//#region GUNZZ !!1!1!1
	
	if(reloading > 0) reloading--;
	else if(reloading === 0)
	{
		ammo = weapon.ammo;
		reloading = -1;
	}
	else
	{
		if(reload > 0) reload--;
		else if(mouseIsPressed && ammo > 0 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)
		{
			shootSound.play();
			ammo--;
			
			x *= 1366;
			y *= 1366;
			
			x += p.pos.x;
			y += p.pos.y;
			
			var _col = Infinity;
			
			for(i = 0; i < map.length; i++)
			{
				var _r = map[i];
				
				if (lineRect(p.pos.x, p.pos.y, x, y, _r))
					_col = min(sq(_r.x + _r.w/2 - p.pos.x) + sq(_r.y + _r.h/2 - p.pos.y), _col);
			}
			
			stroke(0);
			strokeWeight(1);
			line(p.pos.x, p.pos.y, x, y);
			
			for (id in users)
			{
				if (id != socket.id)
				{
					var op = users[id];

					//Check for distance between me and other
					if(sq(op.pos.x - p.pos.x) + sq(op.pos.y - p.pos.y) > _col) continue;
					
					if (lineCircle(p.pos.x, p.pos.y, x, y, op.pos.x, op.pos.y, 10))
					{
						socket.emit('hit', id);
						users[id].health -= weapon.damage;
					}
				}
			}
			
			reload = weapon.reload;
		}
	}
	
	//#endregion
	//#region UI
	
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

	stroke(0);
	strokeWeight(2);
	noFill();
	
	rect(width - 35, height - 55, 30, 50);
	
	fill(255);
	noStroke();
	
	rect(width - 35, height - 5, 30, -(1 - reload / weapon.reload) * 50);
	
	
	
	if(reloading > 0)
	{
		if(frameCount % 10 == 0)
		{
			visibility = !visibility;
		}
	}
	else visibility = true;
	
	if(visibility)
	{
		textSize(28);
		textAlign(RIGHT, TOP);

		stroke(0);

		text(ammo, width - 40, height - 55);
	}
	
	image(crosshair, mouseX-4, mouseY-4);
	
	//#endregion
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
	else if(keyCode == 82)
		reloading = weapon.reloading;
		
}

//#region Collision

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

function rectRect(r1x, r1y, r1w, r1h, r2){

	// are the sides of one rectangle touching the other?

	return r1x + r1w >= r2.x        &&    // r1 right edge past r2 left
		   r1y + r1h >= r2.y        &&    // r1 top edge past r2 bottom
		   r1x       <= r2.x + r2.w &&    // r1 left edge past r2 right
		   r1y       <= r2.y + r2.h       // r1 bottom edge past r2 top
}

//#endregion

//#region Classes


//#endregion