let cnv;

let map = [];
let button;

let weapons = [];
let slider = [];
let addWeapon;
let manual;

let start;



let state = false;

function setup()
{
    cnv = createCanvas(800, 800);
    cnv.position(5, 40);
    
    button = createButton("Save");
    button.position(5, 10);
    button.mouseClicked(saveState);
    
    
    start = createVector();
    
    
    slider[0] = createSlider(0, 2, 0.1, .05);
    slider[0].position(5, 50);
    slider[0].label = "Cooldown";
    
    slider[1] = createSlider(1, 20, 5, 1);
    slider[1].position(5, 80);
    slider[1].label = "Damage";
    
    slider[2] = createSlider(1, 60, 30, 1);
    slider[2].position(5, 110);
    slider[2].label = "Ammo";
    
    slider[3] = createSlider(0, 6, 2, .2);
    slider[3].position(5, 140);
    slider[3].label = "Reload Time";
    
    manual = createCheckbox();
    manual.position(5, 170);
    
    addWeapon = createButton("Add weapon");
    addWeapon.position(10, 200);
    addWeapon.mouseClicked(addToWeapons);
    
    slider.forEach(
        s =>
        {
            s.hide();
        }
    )
    manual.hide()
    addWeapon.hide();
}

function saveState()
{
    saveJSON(state ? weapons : map, state ? 'weapons.json' : 'map.json');
}

function addToWeapons()
{
    weapons.push(
        {
            reload: slider[0].value(),
            damage: slider[1].value(),
            ammo: slider[2].value(),
            reloading: slider[3].value(),
            manual: manual.checked(),
            sprite: 0
        }
    )
}

function draw()
{
    
    switch(state)
    {
        case false:
            background(100);
            
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
        case true:
            background(100);
            
            noStroke()
            fill(255);
            
            textAlign(LEFT, TOP);
            textSize(12);
            
            slider.forEach(
                s =>
                {
                    var pos = s.position();
                    
                    text(s.label + ": " + s.value(), pos.x + s.size().width, pos.y - 37);
                }
            )
            
            text("Manual", 20, 135);
            
            stroke(0);
            strokeWeight(1);
            
            rect(width/2, 0, width/2, height);
            
            fill(0);
            noStroke();
            textSize(16);
            
            weapons.forEach(
                w =>
                {
                    text("{\n  Cooldown: " + w.reload + ",\n  Damage: " + w.damage + ",\n  Ammos: " + w.ammo + ",\n  Reload: " + w.reloading + "\n}", width/2 + 5, 5);
                }
            )
            
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
                slider.forEach(
                    s =>
                    {
                        s.hide();
                    }
                )
                manual.hide();
                addWeapon.hide()
                break;
            case true:
                slider.forEach(
                    s =>
                    {
                        s.show();
                    }
                )
                manual.show();
                addWeapon.show();
                break;
        }
    }
}

function mousePressed()
{
    if(!state)
    {
        switch (mouseButton)
        {
            case LEFT:
                start.set(floor(mouseX / 32) * 32, floor(mouseY / 32) * 32);
                break;
            case RIGHT:
                for (i = 0; i < map.length; i++)
                {
                    var _r = map[i];
                    if (mouseX >= _r.x && mouseX <= _r.x + _r.w && mouseY >= _r.y && mouseY <= _r.y + _r.h)
                    {
                        map.splice(i, 1);
                    }
                }
                break;
        }
    }
    else
    {
        if(mouseButton == RIGHT)
        {
            if(mouseX > width/2)
            {
                for(i = 0; i < weapons.length; i++)
                {
                    if(mouseY > i*96 && mouseY < i*96 + 96)
                    {
                        weapons.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    
    document.oncontextmenu = function ()
    {
        return false;
    }
}

function mouseReleased()
{
    if(mouseButton != LEFT || state) return;
    
    
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
