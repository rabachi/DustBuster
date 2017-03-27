var cv = require('opencv'),
	math = require('mathjs');

// (B)lue, (G)reen, (R)ed
var lower_threshold = [5, 57, 0];
var upper_threshold = [255, 255, 255];
var COLOR = [0,0,255];
var thickness = 2;
const lineType = 8;
const maxLevel = 0;
const thick = 1;

cv.readImage('coin2.jpg', function(err, im) {
	if (err) throw err;
	if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');

	im_copy = im.copy();
	im_copy.convertHSVscale();
	im_copy.inRange(lower_threshold, upper_threshold);
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
		rect = cnts.minAreaRect(c);
		im.rectangle([centerx-rect.size.width/2,centery-rect.size.height/2],[rect.size.width,rect.size.height],COLOR,2);
		im.drawContour(cnts, c, COLOR, thick, lineType, maxLevel, [0, 0]);
		//im.rectangle([centerx,centery],[],COLOR,2);
		im.rectangle([centerx,centery], [2,2],COLOR,2);
	}

	im.save('coin_detected.jpg');
	console.log('Image saved to coin_detected.jpg');
});




































































































































