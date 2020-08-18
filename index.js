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
        users[socket.id] = {pos: {x: 400, y:400}, name: "", health: 100, kills: 0, deaths: 0};
        
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
                users[data[0]].health -= 10;
                socket.broadcast.emit('hit', data);
            }
        );
        
        socket.on('died',
            function(data)
            {
                var p = users[socket.id];
                
                p.pos.x = 400;
                p.pos.y = 400;
                p.health = 100;
                
                p.deaths++;
                users[data].kills++;
                
                socket.broadcast.emit('users', users);
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