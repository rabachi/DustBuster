
// cant access internal storage of drone, save mjpeg stream instead..

var bebop = require("node-bebop"),
	fs = require('fs'),
	//options = {path: '' }, 
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
	try {
    cv.readImage(buf, function(err, im) {
      if (err) {
        console.log(err);
      } else {
        if (im.width() < 1 || im.height() < 1) {
          console.log("no width or height");
          return;
        }

        im.save('drone2.jpg');

        // fs.writeFile('drone.jpg', im, function(err){
        // if (err) throw err;
        console.log('pic saved.');
        // }); 
      }
    });
  } catch(e){
    console.log(e);
  }
},1000);