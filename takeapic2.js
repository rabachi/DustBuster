
// cant access internal storage of drone, save mjpeg stream instead..

var bebop = require("../."),
	fs = require('fs'),
	options = {path: 'path for saving file' }, 
	 cv = require("opencv");
	

var drone = bebop.createClient(),
    mjpg = drone.getMjpegStream(),
   buf = null,
    w = new cv.NamedWindow("Video", 0);

drone.connect(function() {
  drone.MediaStreaming.videoEnable(1);

});

mjpg.on("data", function(data) {
  buf = data;
});

setInterval(function() {
  if (buf == null) {
    return;
  }
	else {
	fs.writeFile('drone.png', data, function(err){
            if (err) throw err
            console.log('pic saved.')
        }); 
}