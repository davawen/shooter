var fs = require('fs');
var http = require('http');

const port = 8080;

function handleRequest(req, res)
{
    fs.readFile(__dirname + req.url,
        function(err,data)
        {
            if(err) 
            {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
        res.writeHead(200);
        res.end(data);
        }
    );
}

var server = http.createServer(handleRequest);
server.listen(port);