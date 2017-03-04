

Calibration.magnetoCalibration(1); // 1 to calibrate, 0 to not 

var bebop = require("../"),
expect = require("chai").expect,

setTimeout(function() {
    drone.startRecording(); // saves it in internal storage 
  }, 5000);


setTimeout(function() {
    drone.stopRecording(); 
  }, 10000); 

// or 

it("#getVideoStream", function() {
    var output;

    var stream = drone.getVideoStream();

    stream.on("data", function(buf) {
      output = buf;
    }); 

    drone.emit("video", new Buffer([0xff]));

    expect(output[0]).to.equal(0xff);
  });