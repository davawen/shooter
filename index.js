const port = process.env.PORT || 8080;

var express = require('express');

var app = express();
var server = app.listen(port);

app.use(express.static('public'));

let io = require('socket.io').listen(server);

let users = {};
let numUsers = 0;

io.sockets.on('connection',
    function(socket)
    {
        numUsers++;
        users[socket.id] = new User();
        
        io.emit('users', users);
        
        socket.on('position',
            data =>
            {
                users[socket.id].pos = data;
                socket.broadcast.emit('position', [socket.id, data]);
            }
        );
        
        socket.on('angle',
            data =>
            {
                users[socket.id].angle = data;
                socket.broadcast.emit('angle', [socket.id, data]);
            }
        );
        
        socket.on('weapon',
            data =>
            {
                users[socket.id].weapon = data;
                socket.broadcast.emit('weapon', [socket.id, data]);
            }
        );
        
        socket.on('shoot',
            data =>
            {
                socket.broadcast.emit('shoot', [socket.id, data[0], data[1]]);
            }
        );
        
        socket.on('sendName',
            data =>
            {
                users[socket.id].name = data;
                socket.broadcast.emit('sendName', [socket.id, data]);
            }
        );
        
        socket.on('hit',
            data =>
            {
                var u = users[data];
                u.health -= 10;
                
                if(u.health <= 0)
                {
                    u.pos.x = 400;
                    u.pos.y = 400;
                    u.health = 100;
                    
                    u.deaths++;
                    users[socket.id].kills++;
                    
                    io.emit('death', [data, socket.id]);
                }
                else socket.broadcast.emit('hit', data);
            }
        );
        
        socket.on('disconnect',
            () =>
            {
                delete users[socket.id];
                numUsers--;
                
                io.emit('users', users);
            }
        );
    }
);

class User
{
    constructor()
    {
        this.pos = { x: 400, y: 400 };
        this.angle = 0;
        this.weapon = 0;
        this.name = "username";
        this.health = 100;
        this.kills = 0;
        this.deaths = 0;
    }
}
