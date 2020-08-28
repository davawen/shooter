let cnv;

let map = [];
let button;

let weapons = [];
let slider = [];
let manual;

let start;



let state = false;

function setup()
{
    cnv = createCanvas(800, 800);
    cnv.position(5, 40);
    
    button = createButton("Save");
    button.position(5, 10);
    button.mouseClicked(save);
    
    
    start = createVector();
    
    
    slider[0] = createSlider(0, 2, 0.1, .05);
    slider[0].position(5, 60);
    
    slider[1] = createSlider(1, 20, 5, 1);
    slider[1].position(5, 90);
    
    slider[2] = createSlider(1, 60, 30, 1);
    slider[2].position(5, 120);
    
    slider[3] = createSlider(0, 6, 2, .2);
    slider[3].position(5, 150);
    
    slider.forEach(
        s =>
        {
            s.hide();
        }
    )
    
    manual = createCheckbox();
    manual.position(5, 180);
    
}

function save()
{
    saveJSON(state ? weapons : map, state ? 'weapons.json' : 'map.json');
}


function draw()
{
    background(100);
    
    switch(state)
    {
        case false:
            stroke(0);
            strokeWeight(1);

            for (i = 0; i < width; i += 32)
            {
                line(i, 0, i, height);
            }
            for (i = 0; i < height; i += 32)
            {
                line(0, i, width, i);
            }

            noStroke();
            fill(0);

            if (mouseIsPressed && mouseButton == LEFT)
            {
                rect(start.x, start.y, floor(mouseX / 32) * 32 - start.x, floor(mouseY / 32) * 32 - start.y);
            }

            map.forEach(
                _r =>
                {
                    rect(_r.x, _r.y, _r.w, _r.h);
                }
            );
        break;
    }
}

function keyPressed()
{
    if(keyCode == ENTER)
    {
        state = !state;
        switch(state)
        {
            case false:
                button.show();
                slider.forEach(
                    s =>
                    {
                        s.hide();
                    }
                )
                break;
            case true:
                button.hide();
                slider.forEach(
                    s =>
                    {
                        s.show();
                    }
                )
                break;
        }
    }
}

function mousePressed()
{
    switch(mouseButton)
    {
        case LEFT:
            start.set(floor(mouseX / 32) * 32, floor(mouseY / 32) * 32);
            break;
        case RIGHT:
            for(i = 0; i < map.length; i++)
            {
                var _r = map[i];
                if(mouseX >= _r.x && mouseX <= _r.x + _r.w && mouseY >= _r.y && mouseY <= _r.y + _r.h)
                {
                    map.splice(i, 1);
                }
            }
            break;
    }
    
    document.oncontextmenu = function ()
    {
        return false;
    }
}

function mouseReleased()
{
    if(mouseButton != LEFT) return;
    
    
    var w = floor(mouseX/32)*32 - start.x;
    var h = floor(mouseY/32)*32 - start.y;
    
    var x = start.x + min(0, w);
    var y = start.y + min(0, h);
    
    w = abs(w);
    h = abs(h);
    
    map.push(new Rectangle(x, y, w, h));
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
