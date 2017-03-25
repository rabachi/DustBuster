var http = require('http');
var fs = require('fs');
var bebop = require("node-bebop");

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);

var drone = bebop.createClient(),
    mjpg = drone.getMjpegStream();

drone.connect(function() {
  drone.MediaStreaming.videoEnable(1);
});

// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');

    socket.on('message', function (message) {
        if (message == "takeoff"){
        	drone.takeoff();
        }
        else if (message == "land"){
        	drone.land();
        }
        console.log('A client is speaking to me! They’re saying: ' + message);
    });
});


server.listen(8080);

mjpg
 .on('error', console.log)
 .on('data', function(data) {
 	io.emit('frame', data.toString('base64'));
 });