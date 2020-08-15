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
        users[socket.id] = {pos: {x: 400, y:400}};
        
        io.emit('newConnection', users);
        
        socket.on('position',
            function(data)
            {
                users[socket.id].pos = data;
                socket.broadcast.emit('position', {'id': socket.id, 'pos': data});
            }
        );
        
        socket.on('disconnect',
            function()
            {
                delete users[socket.id];
                numUsers--;
            }
        );
    }
);