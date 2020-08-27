const port = 8080;

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
            function(data)
            {
                users[socket.id].pos = data;
                socket.broadcast.emit('position', [socket.id, data]);
            }
        );
        
        socket.on('sendName',
            function(data)
            {
                users[socket.id].name = data;
                socket.broadcast.emit('sendName', [socket.id, data]);
            }
        );
        
        socket.on('hit',
            function(data)
            {
                var u = users[data[0]];
                u.health -= 10;
                
                if(u.health <= 0)
                {
                    u.pos.x = 400;
                    u.pos.y = 400;
                    u.health = 100;
                    
                    u.deaths++;
                    users[data[1]].kills++;
                    
                    io.emit('death', [data[0], data[1]]);
                }
                else socket.broadcast.emit('hit', data);
            }
        );
        
        socket.on('disconnect',
            function()
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
        this.name = "";
        this.health = 100;
        this.kills = 0;
        this.deaths = 0;
    }
}
