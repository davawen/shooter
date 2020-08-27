let map = [];

let start;

function Obstacle(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

function setup()
{
    createCanvas(400, 400);
    
    start = createVector();
}

function mousePressed()
{
    start.set(mouseX, mouseY);
}

function mouseReleased()
{
    map.push(new Obstacle(start.x, start.y, mouseX - start.x, mouseY - start.y));
    
    console.log(map);
}

function draw()
{
    background(100);
    
    noStroke();
    fill(0);
    
    if(mouseIsPressed)
    {
        rect(start.x, start.y, mouseX - start.x, mouseY - start.y);
    }
    
    map.forEach(
        o =>
        {
            rect(o.x, o.y, o.w, o.h);
        }
    );
}

function keyPressed()
{
    if(keyCode == ENTER)
    {
        saveJSON(map, 'map.json');
    }
}