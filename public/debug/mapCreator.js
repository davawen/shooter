let map = [];

let start;

let cnv, button;


function setup()
{
    cnv = createCanvas(400, 400);
    cnv.position(5, 40);
    
    button = createButton("Save");
    button.position(5, 10);
    button.mouseClicked(saveMap);
    
    start = createVector();
}

function saveMap()
{
    saveJSON(map, 'map.json');
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
        _r =>
        {
            rect(_r.x, _r.y, _r.w, _r.h);
        }
    );
}

function mousePressed()
{
    start.set(mouseX, mouseY);
}

function mouseReleased()
{
    map.push(new Rectangle(start.x, start.y, mouseX - start.x, mouseY - start.y));
}


class Rectangle
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
