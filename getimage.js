var bebop = require("node-bebop"),
    cv = require("opencv"),
    math = require('mathjs');

var drone = bebop.createClient(),
    mjpg = drone.getMjpegStream(),
    buf = null,
    w = new cv.NamedWindow("Video", 0);

var lower_green = [0, 175, 32];
var upper_green = [11, 255, 156];
var COLOR = [0,0,255];
var thickness = 2;
const lineType = 8;
const maxLevel = 0;
const thick = 1;

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
          im_copy = im.copy();
          im_copy.convertHSVscale();
          im_copy.inRange(lower_green, upper_green);
          im_copy.erode(2);
          im_copy.dilate(2);
          cnts = im_copy.findContours(cv.RETR_EXTERNAL);
          center = null; 
          var c = null;
          console.log(cnts.size());
          if (cnts.size() > 0) {
            c = 0;
            var maxArea = cnts.area(0);
            for (i = 1; i < cnts.size(); i++){
              if(cnts.area(i) > maxArea){
                maxArea = cnts.area(i);
                console.log(cnts.area(i));
                c = i;
              }
            }

            //c = math.max(cnts);
            //(x1,y1,x2,y2) = c.minAreaRect();
            moments = cnts.moments(c);
            console.log(moments);
            centerx = math.round(moments.m10/moments.m00);
            centery = math.round(moments.m01/moments.m00);
          }
          console.log(centerx,centery);

          if (cnts.area(c) > 0){
            im.drawContour(cnts, c, COLOR, thick, lineType, maxLevel, [0, 0]);
            //im.rectangle([centerx,centery],[],COLOR,2);
            im.rectangle([centerx,centery], [2,2],COLOR,2);
          }


        w.show(im);
        w.blockingWaitKey(0, 50);
      }
    });
  } catch(e) {
    console.log(e);
  }
}, 100);