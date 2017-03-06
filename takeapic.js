"use strict";

var bebop = require("node-bebop");
var util = require('util');
var cv = require("opencv");

var drone = bebop.createClient(),
    mjpg = drone.takePicture(),
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

    else{

      mjpg.save("/Users/monicakhalil/DustBuster"); // i dont think this path would work on your computer...
    }

