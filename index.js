const port = 8080;

var express = require('express');

var app = express();
var server = app.listen(port);

app.use(express.static('public'));