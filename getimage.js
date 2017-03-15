var bebop = require("node-bebop"),
    cv = require("opencv"),
    math = require('mathjs'),
    time = require('time'),
    fs = require('fs');

var drone = bebop.createClient(),
    mjpg = drone.getMjpegStream(),
    logger = fs.createWriteStream('log.txt', {flags:'w'}),
    buf = null,
    text_buf = null,
    text_buffer = null,
    w = new cv.NamedWindow("Video_raw", 0),
    w_copy = new cv.NamedWindow("Video_masked", 0);

var lower_green = [33, 88, 98];
var upper_green = [88, 255, 255];

var COLOR = [0,0,255];
var thickness = 2;
var c = null;
var maxArea=0;
var cnts = null,
    centerx = null,
    centery = null,
    moments = null;

var dt_list = [0.2,0.2,0.2,0.2,0.2];
var avg_dt = 0.2;



var error_list = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var error_avg = 0;
var then = process.hrtime(),
    dt = 0;

var error = 0;  
var controller_output = 0,
    previous_error = 0,
    integral = 0,
    derivative = 0,
    Kp = 0.5,
    Ki = 0.2,
    Kd = 0.1;


var t_const = 0.25; // just a time constant for the speed.  
var speed = 2; // speed to be changed to speed = error* t_const until target is reached, when target is reached, move forward with speed =10. 
var flag = 0; // set flag =0

var perWidth = 0;

const lineType = 8;
const maxLevel = 0;
const thick = 1;
const focalLength = 401.652173913,
    known_width = 17.25;

function find_distance(knownWidth, focalLength, perWidth){
  return (knownWidth * focalLength) / perWidth;
}

drone.connect(function() {
  drone.MediaStreaming.videoEnable(1);

  setTimeout(function(){
    drone.takeOff();
    //drone.forward(2);
  },9000);

  setTimeout(function(){
    console.log("start hover 1");
    drone.stop();
    //drone.forward(2);
  },12000);

  setTimeout(function(){
    console.log("start hover 2");
    drone.stop();
  },20000);

  process.on('SIGINT',function(){
    console.log("Shutting down");
    drone.land();
    setTimeout(function(){
      logger.end();
      process.exit(0);
    },5000);
  });
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
          // //console.log("width: ",im.width()); //640
          // //console.log("height: ",im.height()); //368
          im_copy = im.copy();
          im_copy.convertHSVscale();
          im_copy.inRange(lower_green, upper_green);
          im_copy.erode(2);
          im_copy.dilate(2);
          cnts = im_copy.findContours(cv.RETR_EXTERNAL);
          center = null; 
          
          //console.log(cnts.size());
          if (cnts.size() > 0) {
            c = 0;
            maxArea = cnts.area(0);
            for (i = 1; i < cnts.size(); i++){
              if(cnts.area(i) > maxArea){
                maxArea = cnts.area(i);
                //console.log(cnts.area(i));
                c = i;
              }
            }
            //c = math.max(cnts);
            //(x1,y1,x2,y2) = c.minAreaRect();
            moments = cnts.moments(c);
            //console.log(moments);
            centerx = math.round(moments.m10/moments.m00);
            centery = math.round(moments.m01/moments.m00);
          }
          //console.log(centerx,centery);

          //***what happens to centerx and centery when target is out of bounds?
          
          if (maxArea > 0){
            im.drawContour(cnts, c, COLOR, thick, lineType, maxLevel, [0, 0]);
            //console.log("area: ", cnts.area(c));
            //im.rectangle([centerx,centery],[],COLOR,2);
            im.rectangle([centerx,centery], [2,2],COLOR,2);
            error = 320 - centerx; 
            dt = process.hrtime(then)[1] / 1000000000.0;

            dt_list.shift();
            dt_list.push(dt);
            avg_dt = math.mean(dt_list);

            error_list.shift();
            error_list.push(error);
            error_avg = math.mean(error_list);

            console.log(dt_list);
            integral = integral + error_avg * avg_dt; //dt = 0.1 s
            derivative = (error_avg - previous_error) / avg_dt;

            
            //console.log(toFile);

            controller_output = Kp*error_avg+ Ki*integral + Kd*derivative;

            text_buf = avg_dt.toString() + "\t" + centerx.toString() + "\t" + controller_output.toString() + "\t" + error_avg.toString() + "\t"+ maxArea.toString() + "\n";
            logger.write(text_buf);

            previous_error = error_avg;

            speed = math.round(controller_output);

            console.log("error: ", error);
            
            if (math.abs(error) < 20){ 
              console.log("forward..");
              drone.forward(10); 
              setTimeout(function(){
                drone.stop();
              },20);
            }
            else if (speed > 0){
              console.log("moving left at ", speed);
              drone.counterClockwise(speed);
              setTimeout(function(){
                  console.log("hover");
                  drone.stop(); 
              },20);
            }
            else if (speed < 0){
              console.log("moving right...", math.abs(speed));
              drone.clockwise(math.abs(speed)); // not sure if this should be a timeout function? if timeout, for how long?
              setTimeout(function(){
                  console.log("hover");
                  drone.stop(); 
              },20);
            }
            else {
              console.log("what's here?", speed, error);
            }
          }


        w.show(im);
        w.blockingWaitKey(0, 50);

        w_copy.show(im_copy);
        w_copy.blockingWaitKey(0, 50);

        then = process.hrtime();
      }
    });
  } catch(e) {
    console.log(e);
  }
}, 100);

