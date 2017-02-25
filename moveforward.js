"use strict";

var bebop = require("node-bebop");
var util = require('util');

var drone = bebop.createClient();

drone.connect(function() {
	drone.MediaStreaming.videoEnable(1);
  	drone.Piloting.takeOff();

	drone.Piloting.pcmd(1,100,0,0,0,0);
	drone.Piloting.pcmd(0,50,0,0,0,0);
  	// setTimeout(function() {
  	// 	//Piloting.pcmd(flag, roll, pitch, yaw, gaz, timestampAndSeqNum)
  	// 	drone.Piloting.pcmd(0,50,0,0,0,0);
  	// },500);


  	setTimeout(function() {
    	drone.Piloting.landing();
  	}, 5000);
});