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


 var x = [{"updated":"2020-07-19T14:50:37.420Z","home":5.7,"away":1.77,"draw":3.9},{"updated":"2020-07-19T13:27:07.735Z","draw":4.2,"away":1.72,"home":5.8}]
 var y = {"a":1}
 x.unshift(y)
 console.log(x)

console.log()

 var z = [{"updated":"2020-07-19T13:27:07.872Z","draw":3.45,"away":3.2,"home":2.82}]
 var a = {"home":2.66,"away":2.96,"draw":3.15,"updated":"2020-07-19T15:03:07.373Z"}
 z.unshift(a)
console.log(z)
