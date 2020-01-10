const {GetHXPins, GetHXPins2} = require('../../db/sequelize');
const Queue = require('../../public/js/queue.js');

var HX711_SENSOR = require ('hx711');
var isHX711SensorsInitialized = false;

var isRRinitialized = false;
var hx711DataQueue = new Queue();
var sMax = [];
var sMin = [];
var sAvg = [];



module.exports.CreateSensorObjects = new Promise( function(resolve, reject) {
   
   GetHXPins(
      (result, error) => {
         if (error) {
            console.log(error);
            reject(error);
         } else {
            console.log("I got it :-) => ", result, " Error:", error);
            sensors = [];
            result.forEach((sensor,index, result) => {
               console.log("initialize new HX711Sensor (", index, 
                  ") clkPin:", sensor.wPiclkPin, 
                  " dataPin:", sensor.wPidataPin);
               sensors[index] = new HX711_SENSOR(sensor.wPiclkPin, sensor.wPidataPin);
            });
            console.log("Physical HX711 sensorlist : ", sensors.length);
            resolve(sensors);
         }
      });
});


module.exports.sensors = [];
module.exports.hx711DataQueue ;
//
// return a single HX711 Sensor (id)
// if sensor object list is not available return null
module.exports.SingleHX711Sensor = (id) => {
   id = (id >= 0 && id < 4) ? id : 0;
   if (!isHX711SensorsInitialized) {
      isHX711SensorsInitialized = false;
      return null;
   }
   return sensors[id];
}

//
// if hx711 sensors are available the application do two things
//
// a) if in RUN-Mode, sensor values are stored insidel SQLite
// b) populate sensor data to client
//
// to avoid due to slow database access or slow sensor access longer refresh time at client site
// we do  
//    (1) async process read sensor data and write (push) into queue
//    (2) async process read from queue (pop) write to database
//    (3) async process read every time first element in queue
//    
//    An element in the queue is an array with numberOfSensors rows.
//    Every row describe one sensor
//    [
//    [{id: 1, value:<value>, min:<value>, max:<value>, avg:<value}, {id: 2, ...}, {id: 3, ...}, {id: 4, ...}], 
//    [{id: 1, value:<value>, min:<value>, max:<value>, avg:<value}, {id: 2, ...}, {id: 3, ...}, {id: 4, ...}], 
//    [{id: 1, value:<value>, min:<value>, max:<value>, avg:<value}, {id: 2, ...}, {id: 3, ...}, {id: 4, ...}], 
//    [{id: 1, value:<value>, min:<value>, max:<value>, avg:<value}, {id: 2, ...}, {id: 3, ...}, {id: 4, ...}]
//    ...
// ]
function ContinousHX711Read(buffersize=10, numberSensors=4) {
   sA = [];
   for (x = 0; x < numberSensors; x++) {
      v = {};
      v.id = x;
      // get physical sensor value
      v.value = sensor[x].getUnit();
      v.max = sMax[x];
      if (sMax[x] < v.value) {
         v.max = v.value;
         sMax[x] = v.value;
      }
      v.min = sMin[x];
      if (sMin[x] > v.value) {
         v.min = v.value;
         sMin[x] = v.value;
      }   
      sA[x] = v;   
   }
   hx711DataQueue.push(sA);
}

