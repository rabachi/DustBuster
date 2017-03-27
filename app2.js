var http = require('http');
var fs = require('fs');
var bebop = require("node-bebop");
var math = require('mathjs'),
    time = require('time');
var express = require('express');
 var path = require('path')
    url = require('url');

var app = express();

// Loading the index file . html displayed to the client



var server = http.createServer(app);
var io = require('socket.io').listen(server);
app.use(express.static(path.join(__dirname, 'public')));
   
   app.get('/',function(req, res) {
    fs.readFile('./index2.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
});
});



// Loading socket.io

//app.use(express.static(path.join(__dirname, 'public')));
// var drone = bebop.createClient(),
//     mjpg = drone.getMjpegStream(),
//     logger = fs.createWriteStream('log.txt', {flags:'w'}),
//     buf = null,
//     battery_level = null;

// drone.connect(function() {
//   drone.MediaStreaming.videoEnable(1);
// });


// var go = false; 

// drone.on("battery", function (data) {
// 	battery_level = data;
// 	io.emit('message',data.toString());
// 	console.log(data);
// });

// mjpg
// 	.on('error', console.log)
// 	.on('data', function(data) {
// 		buf = data;
// 		io.emit('frame', data.toString('base64'));
// 	});

// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');

    socket.on('message', function (message) {
        if (message == "takeoff"){
        	console.log(typeof buf);
        	//go = true;
        	//getimage.get_to_target(drone,buf,logger);
        }
        else if (message == "land"){
        	drone.land();
        }
        console.log('A client is speaking to me! They’re saying: ' + message);
    });


});


app.listen(8080);

