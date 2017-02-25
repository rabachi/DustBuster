
// need to import this in the getImage.js
module.exports = follow_target;

// referece = half the image.width() from getImagestream  
// position = x_midpoint of the image detected
// maxX = max image.width()
function follow_target (reference ,position, maxX){ 
var error = 0; 	
var t_const = 25; // just a time constant for the speed.  
var speed = 10; // speed to be changed to speed = error* t_const until target is reached, when target is reached, move forward with speed =10. 
var flag = 0; // set flag =0

	while (flag !=1){

		error = reference - position; 
		if ( 0 < error < 5){
			speed = error * t_const;
			drone.left(speed);
			drone.stop (); // so it wont keep going left
		}
		else if (-5 <error <0){
			speed = error* t_const;
			drone.right(speed); // not sure if this should be a timeout function? if timeout, for how long? 
			drone.stop(); // so it wont keep going right
		}
		else {
			if (position > maxX || error > 5 || error < 5){ // outofbounds or error is not realistic 
			drone.stop(); 
			flag =1; // breaks while loop
			}
			else 
			drone.forward(speed); // we are at reference, just go forward
		}	
}

}
// do a dance to clean the panel
// durations for all the functions? 

setTimeout(function() {
    drone.right(10);
  }, );

set Timeout(function() {
	drone.stop(); 
}, );

set Timeout(function(){
	drone.left(10); 

}, );

set Timeout(function (){
	
	drone.stop(); 

}, );

// done cleaning , turn around
set Timeout(function (){
	
	drone.counterclockwise(-100); 

}, );

