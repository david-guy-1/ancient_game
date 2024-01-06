//@ts-ignore
import _ from "lodash";

//ax+by=c
type line = [number,number,number] ;

export function pointInsideRectangle(px : number, py: number, tlx: number, tly: number, width: number, height: number) : boolean{
	if(px < tlx || px > tlx+width || py < tly || py > tly+height){
		return false;
	}
	return true;
}
export function getIntersection(line1: line, line2: line) : [number, number]{
	// lines are to be in the form of "ax + by = c", the lines are coefficients.
	var a = line1[0] , b = line1[1], c = line2[0], d = line2[1];
	var determinant = a*d-b*c;
	if (Math.abs(determinant) < 0.000001){
		throw "lines are too close to parallel";
	}
	// get the inverse matrix
	var ai = d/determinant, bi = -b/determinant, ci = -c/determinant, di = a/determinant;
	// now multiply
	return [ai * line1[2] + bi * line2[2], 	ci * line1[2] + di * line2[2]];
	
}
//given points (p1, p2), output the a,b,c coefficients that go through them

// either [p1x, p1y, p2x, p2y] or [p1x, p1y], [p2x, p2y] , or p1x,p1y,p2x,p2y
export function pointToCoefficients(p1x : number | number[], p1y :  number |number[] |  undefined = undefined, p2x :  number | undefined  = undefined , p2y :  number | undefined  = undefined) : line{
	// overloading:
	if(typeof(p1x) == "object" && p1x.length == 4 && p1y == undefined){
		return pointToCoefficients(p1x[0],p1x[1],p1x[2],p1x[3]) ;
	}
	
	if(typeof(p1x) == "object" && typeof(p1y) == "object" &&  p1x.length == 2  && p1y.length == 2  && p2x == undefined){
		return pointToCoefficients(p1x[0],p1x[1],p1y[0],p1y[1]) ;
	}
	if(typeof p1x != "number" || typeof p1y != "number"  || typeof p2x != "number"  || typeof p2y != "number" ){
		throw "invalid call to pointToCoefficients " + [p1x, p1y, p2x, p2y] 
	}
	// solve the equation :
	
	if (p1x == p2x){ // vertical line
		return [1, 0, p1x]; // x = p1x
	}  else {
		var m = (p2y - p1y) / (p2x - p1x); // slope
		var b = p1y - m*p1x;
		// y = mx + b -> y - mx = b
		return [-m, 1, b];
	}
}

export function between(x : number,b1 : number, b2 : number) : boolean{ // returns if x is between b1 and b2  (inclusive)
	if (b1 <= x && x <= b2){
		return true;
	}
	if (b1 >= x && x >= b2){
		return true;
	}
	return false
}
// lines are P = (p1x, p1y, p2x, p2y) and Q = (q1x, q1y, q2x, q2y)
// intersection must be between endpoints
export function doLinesIntersect(p1x: number | number[], p1y : number | number[] | undefined = undefined, p2x : number | undefined = undefined, p2y : number | undefined = undefined, q1x : number | undefined = undefined, q1y : number | undefined = undefined, q2x : number | undefined = undefined, q2y : number | undefined = undefined){
	// so you can call with array
	if(typeof(p1x) == "object" && p1x.length == 8 && p1y == undefined){
		return doLinesIntersect(p1x[0],p1x[1],p1x[2],p1x[3],p1x[4],p1x[5],p1x[6],p1x[7]) ;
	}
	if(typeof(p1x) == "object" && typeof(p1y) == "object" &&  p1x.length == 4  && p1y.length == 4  && p2x == undefined){
		return doLinesIntersect(p1x[0],p1x[1],p1x[2],p1x[3],p1y[0],p1y[1],p1y[2],p1y[3]) ;
	}
	if(typeof p1x != "number" ||typeof p1y != "number" ||typeof p2x != "number" ||typeof p2y != "number" ||typeof q1x != "number" ||typeof q1y != "number" ||typeof q2x != "number" ||typeof q2y != "number"){
		throw "invalid call to doLinesIntersect " + [p1x, p1y, p2x, p2y] 
	}
	
	var line1=pointToCoefficients(p1x, p1y, p2x, p2y);
	var line2=pointToCoefficients(q1x, q1y, q2x, q2y);
	try{
		var intersectionPoint = getIntersection(line1, line2)
	} catch(err){
		if(err == "lines are too close to parallel"){
			return false;
		} else {
			throw err;
		}
	}
	return (between(intersectionPoint[0]  , p1x, p2x) &&
	between(intersectionPoint[0]  , q1x, q2x) &&
	between(intersectionPoint[1]  , p1y, p2y) &&
	between(intersectionPoint[1]  , q1y, q2y));
}
// doLinesIntersect(412, 666, 620 , 434, 689, 675, 421, 514) = true
// doLinesIntersect(412, 666, 620 , 434, 498 ,480 ,431 ,609 ) = false 
// doLinesIntersect(100, 100, 200, 100, 100, 200, 200, 200) = false

// find where a line segment (given by two points) intersects the rectangle. the first point is inside the rectangle and the second point is outside.

export function getLineEnd(p1x : number, p1y: number, p2x: number, p2y: number, tlx: number, tly: number, width: number,height: number) : [number, number]{
	// ensure p1 is inside and 
	if(!pointInsideRectangle(p1x, p1y, tlx, tly,  width,height)){
		throw "p1 outside of rectangle";
	}
	if(pointInsideRectangle(p2x, p2y, tlx, tly, width,height)){
		throw "p2 inside rectangle";
	}
	//convert the line to ax+by=c
	// a (p2x - p1x) = -b (p2y - p1y)
	var a,b,c
	if(p2y - p1y != 0){ // a is not 0, set a = 1 (use this chart)
	// if a = 0 then b = 0 as well, we have 0 = c, so c = 0. This gives [0,0,0] which is not a point in P^2
	// a (p2x - p1x)/(p2y - p1y) = -b 
		a = 1;
		b = -(p2x - p1x)/(p2y - p1y);
		c = a*p1x + b*p1y ;
	} else {
		//p2y = p1y, so subtracting the equations gives a  = 0/(p2x - p1x) = 0
		// now we are in P^1 with b and c. We are solving by=c in P^1. 
		// so if y = 0 then we have [0,1,0]. Else, we have [0,?,1]
		a = 0;
		if(p2y == 0){
			b = 0;
			c = 0;
		} else{
			c = 1;
			b = c/p2y;
		}
	}
	var lineCoefficients : line = [a,b,c];
	var topLine : line = [0, 1, tly];// y = top left y
	var leftLine  : line= [1, 0, tlx] // x = tlx
	var rightLine  : line=[1, 0, tlx+width] // x = tlx+width
	var bottomLine  : line= [0, 1, tly+height];// y = top left y + height
	var lines = [topLine, leftLine, rightLine, bottomLine]
	for(var i=0; i<4; i++){
		var line = lines[i]
		try {
			var intersection = getIntersection(lineCoefficients, line);
			// intersection must be inside the rectangle
			if(pointInsideRectangle(intersection[0], intersection[1],  tlx, tly,  width,height)){
			// and must also be in the correct direction of the second line:
				if((intersection[0] - p1x) * (p2x-p1x) + (intersection[1] - p1y) * (p2y-p1y) >= 0){
					return intersection;
				}
			}
		}catch (e){
			if(e == "lines are too close to parallel"){
				;
			} else {
				throw e;
			}
		}
	}
	throw "oops";
}

export function testCases(){
	//getLineEnd(p1x, p1y, p2x, p2y, tlx, tly, height, width){
	console.log("This should be 5,5")
	console.log(getLineEnd(0,0,100,100,-10,-5,20,10)); // output should be 5,5, line is [1,-1,0]	
	
	console.log("This should be 166.216, 390")
	console.log(getLineEnd(159.1,337.34,207.9,689.46,133,260,150,130)); // output should be 166.216, 390, line is [3.7,-0.5,420]

	
	console.log("This should be 207.407, 260")
	console.log(getLineEnd(242,291.133,80,145.333,133,260,150,130)); // output should be 207.407, 260, line is [2.7,-3,-220]
	
	
	console.log("This should be 283, 328.033")
	console.log(getLineEnd(242,291.133,445, 473.833,133,260,150,130)); // output should be 283, 328.033, line is [2.7,-3,-220]  
	
	console.log("This should be 174, 390 (vertical line)")
	console.log(getLineEnd(174 ,300,174, 600,133,260,150,130)); // output should be 174, 390, line is [1,0,174] 
	
	
	console.log("This should be 133, 290 (horizontal line)")
	console.log(getLineEnd(211 ,290,1, 290,133,260,150,130)); // output should be 133, 290, line is [0,1,290] 
	
	console.log("all done")
}

	// given the coordinates of the top left (x and y smallest) corner of a rectangle, and its width and height, find the coordinates of the others. 
	// angle is  : look at rectangle's right, how much do you have to turn to look straight right?

	// the same as the other one : (positive x) is 0, and for angles close to 0, increasing is positive y. 
	
	//note this is different from the angle that angleToRadians returns. To convert from angleToRadians to our angle, add pi/2
	
	// returns the corners in a cyclic order. 
export function corners(tlx : number, tly: number,  width: number,  height: number,  angle: number, ){
	//console.log([tlx, tly, width, height, angle]);
		var cornersLst = [[tlx, tly]]
		// travel "rightward" (width) units along (angle)
		cornersLst.push([cornersLst [0][0]+ width * Math.cos(angle), cornersLst[0][1] + width * Math.sin(angle)])
		
		//travel "upwards" (height) units along angle- 90 degrees
		cornersLst.push([cornersLst[1][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[1][1]+ height * Math.sin(angle + Math.PI / 2)])
		
		//travel "upwards" from the start
		cornersLst.push([cornersLst[0][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[0][1] + height * Math.sin(angle +Math.PI / 2)])
		
		
		return cornersLst
	}
	
export function union(x : Iterable<any>, y : Iterable<any>){
	return  new Set(_.union(Array.from(x), Array.from(y)));
}

export function filter<T>(set : Iterable<T>, f : (a : T) => Boolean): Set<T>{
	return  new Set(Array.from(set).filter(f));
}

export function normalize(v : number[], l : number){
	var length = Math.sqrt(_.sum(v.map((x) => x*x)));
	if(length == 0) { 
		throw "normalizing a zero vector"
	}
	return v.map((x) => x/length * l);

}