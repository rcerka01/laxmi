var d = new Date();
console.log(d.getFullYear() + " " + d.getDate() + " " + d.getHours() + " " + d.getMinutes() + " " + d.getSeconds());

console.log(new Date().toLocaleString()); 

var k = [1,2,3]

var threshold = 0.2;

function isAboveThreshold(prev, curr) {
    if (prev - curr > threshold || curr - prev > threshold ) { return true; }
    return false;
 }

 console.log( isAboveThreshold(4, 4.3))
