var http = require('http');
var fs = require('fs');
var bebop = require("node-bebop");
var cv = require("opencv"),
    math = require('mathjs'),
    time = require('time'),
    events = require('events'),
    serialport = require('serialport');
var express = require('express');
var path = require('path')
    url = require('url');

var app = express();

var portName = '/dev/tty.usbmodem1411';
var sp = new serialport(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\r\n")
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/',function(req, res) {
  fs.readFile(__dirname+'/public/index2.html', 'utf-8', function(error, content){
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(content);
  });
});



// // Loading the index file . html displayed to the client
// var server = http.createServer(function(req, res) {
//     fs.readFile('./plottest.html', 'utf-8', function(error, content) {
//         res.writeHead(200, {"Content-Type": "text/html"});
//         res.end(content);
//     });
// });

var drone = bebop.createClient(),
    mjpg = drone.getMjpegStream(),
    logger = fs.createWriteStream('log.txt', {flags:'w'}),
    io = require('socket.io').listen(server),
    eventEmitter = new events.EventEmitter();

var go = false;

var battery_level = null,
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
    moments = null,
    rect = null;

var dt_list = [0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2];
var avg_dt = 0.2;

var last_move = -1;

var error_list = [0,0,0,0,0,0,0];
var error_avg = 0;

error_y = 0;
var centery_list = [184,184,184,184,184];
var centery_avg = 0;

var centerx_list = [320,320,320,320,320,320,320];
var centerx_avg = 0;

var then = process.hrtime(),
    dt = 0;

var error = 0;  
var controller_output = 0,
    previous_error = 0,
    integral = 0,
    derivative = 0,
    Kp = 0.18,
    Ki = 0.016,
    Kd = 0.01,
    K_forward = 0.017,
    distance_thres = 80;

var going_forward = 0;
var t_const = 0.25; // just a time constant for the speed.  
var speed = 2; // speed to be changed to speed = error* t_const until target is reached, when target is reached, move forward with speed =10. 
var flag = 0; // set flag =0
var iter = 0;
var perWidth = 0,
    distance = 0,
    distance_list = [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],
    distance_avg = 100;

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

  process.on('SIGINT',function(){
    console.log("Shutting down");
    drone.land();
    setTimeout(function(){
      logger.end();
      process.exit(0);
    },5000);
  });

  process.on('exit',function(){
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
  io.emit('frame', data.toString('base64'));
});

drone.on("battery", function (data) {
  battery_level = data;
  io.emit('messagebattery', data.toString());
  //console.log(data);
});

sp.on('data', function(input) {
    io.emit('messagevoltage', input.toString());
});

var startRoutine = function startRoutine(){
  // setTimeout(function(){
  //   drone.takeOff();
  //   //drone.forward(2);
  // },9000);

  // setTimeout(function(){
  //   console.log("start hover 1");
  //   drone.stop();
  //   //drone.forward(2);
  // },12000);

  // setTimeout(function(){
  //   console.log("start hover 2");
  //   drone.stop();
  // },20000);

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
            im_copy2 = im_copy.copy();
            cnts = im_copy.findContours(cv.RETR_EXTERNAL);
            center = null; 
            maxArea = 0;
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
              rect = cnts.minAreaRect(c);
              im.rectangle([centerx-rect.size.width/2,centery-rect.size.height/2],[rect.size.width,rect.size.height],COLOR,2);
              //im.drawContour(cnts, c, COLOR, thick, lineType, maxLevel, [0, 0]);
              //console.log("area: ", cnts.area(c));
              im.rectangle([centerx,centery], [2,2],COLOR,2);

              centerx_list.shift();
              centerx_list.push(centerx);
              centerx_avg = math.mean(centerx_list);

              centery_list.shift();
              centery_list.push(centery);
              centery_avg = math.mean(centery_list);

              error = 320 - centerx_avg; 
              error_y = 184 - centery_avg;

              if(error_y < -60) {
                console.log("down");
                drone.down(5);
              }
              else if (error_y > 60){
                console.log("up");
                drone.up(5);
              }

              dt = process.hrtime(then)[1] / 1000000000.0;

              dt_list.shift();
              dt_list.push(dt);
              avg_dt = math.mean(dt_list);

              error_list.shift();
              error_list.push(error);
              error_avg = math.mean(error_list);

              //console.log(dt_list);
              integral = integral + error_avg * avg_dt; //dt = 0.1 s
              derivative = (error_avg - previous_error) / avg_dt;

              
              //console.log(toFile);
              controller_output = Kp*error_avg+ Ki*integral + Kd*derivative;

              if (math.abs(error_avg) < 30){ 
                perWidth = rect.size.width;
                distance = find_distance(known_width,focalLength,perWidth);
              }

              distance_list.shift();
              distance_list.push(distance);
              distance_avg = math.mean(distance_list);

              previous_error = error_avg;

              speed = math.round(controller_output);

              console.log("error: ", error);
              

              if(iter >= 10){

                if (math.abs(error_avg) < 30){ 
                    controller_output = 0;  

                    if(distance_avg > distance_thres){
                      console.log("forward..", distance_avg * K_forward);
                      drone.forward(distance_avg * K_forward); 
                    }
                    else{
                      drone.land();
                      go = false;
                    }

                }
                else if (speed > 0){
                  console.log("moving left at ", speed);
                  drone.counterClockwise(speed);
                  setTimeout(function(){
                      console.log("hover");
                      drone.stop(); 
                  },60);
                  last_move = -1; //left
                }
                else if (speed < 0){
                  console.log("moving right...", math.abs(speed));
                  drone.clockwise(math.abs(speed)); // not sure if this should be a timeout function? if timeout, for how long?
                  setTimeout(function(){
                      console.log("hover");
                      drone.stop(); 
                  },60);
                  last_move = 1; //right
                }
                else {
                  console.log("what's here?", speed, error);
                }

                text_buf = avg_dt.toString() + "\t" + centerx_avg.toString() + "\t" + (-1*controller_output).toString() + "\t" + error_avg.toString() + "\t"+ distance.toString() + "\n";
                logger.write(text_buf);
              }
            }
            else {//maxArea =0 
              
              if (last_move == -1){//last move was left, try right
                //cw
                drone.clockwise(70);
              }
              else if (last_move == 1){
                //ccw
                drone.counterClockwise(70);
              }
              
              setTimeout(function(){
                console.log("hover");
                drone.stop(); 
              },60);
              
              console.log("maxArea was 0");

              controller_output = 0;
            }
          
          console.log("iter", iter);
          w.show(im);
          w.blockingWaitKey(0, 50);

          w_copy.show(im_copy2);
          w_copy.blockingWaitKey(0, 50);

          then = process.hrtime();
          iter = iter + 1;
          // drone.stop();
        }
      });
    } catch(e) {
      console.log(e);
    }
  }, 200);
}

eventEmitter.on('start', startRoutine);


// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');

    socket.on('message', function (message) {
        if (message == "takeoff"){
          //console.log(typeof buf);
          eventEmitter.emit('start');
          //getimage.get_to_target(drone,buf,logger);
        }
        else if (message == "land"){
          console.log("landing...");
          drone.land();
          //logger.end();
          process.emit('exit', 0);

        }
        console.log('A client is speaking to me! They’re saying: ' + message);
    });
});

app.listen(8080);



