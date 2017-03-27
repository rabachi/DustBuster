var http = require('http');
var fs = require('fs');
var bebop = require("node-bebop");
var cv = require("opencv"),
    math = require('mathjs'),
    time = require('time'),
    getimage = require('./getimage_copy.js');

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./plottest.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);

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


server.listen(8080);

