//--------------------------------------------------
// Controller for HX711 configuration site
//
// 
//--------------------------------------------------

var debug = require('debug')
var util = require("util");
var {body, validationResult} = require('express-validator');
var {sanitizeBody} = require('express-validator');

var WebSocket = require('ws');
const wss = new WebSocket.Server({port:3003});

//const stringinject = require('stringinject');

const {HX711SensorDB, PiPinList, Query, HX711SensorPins, getResults} = require('../../db/sequelize');
const {SingleHX711Sensor, CreateSensorObjects, hx711DataQueue} = require ('../../models/analyze/hx711Sensor');

var pinList = [];  
var valueList = [];
var fieldNames = [];
var phyHX711List = [];

var async = require('async');

var isWSConnected = false;
var myWS;

//----------------------------------------------------
// WebSite stuff
//----------------------------------------------------

async function prepareData() {
   //
   // read a Raspberry Pi Pin-List
   // this pinlist contains WirinPi numbering and is sorted by GPIO pins
   await PiPinList.findAll({
      order : [['gpio','DESC']]
   }
   ).then(
      // read table configPins
      (configPins) => {
         console.log("await PiPinList.findAll()");
         for (i in configPins) {
            pinList[i] = configPins[i].dataValues;
            //console.log("Pin (", pinList[i]);
         }
         console.log(JSON.stringify(pinList));
      }
   );

   //
   // read all configured sensors
   await HX711SensorDB.findAll().then(
      (configHX711Sensors) => {
         console.log("await HX711Sensor.findAll()");
         for (i in configHX711Sensors) {
            //console.log("HX711 (", configHX711Sensors[i].dataValues, ")");
            row = configHX711Sensors[i].dataValues;
            valueList[i] = row;
            //console.log('(%d) Record : %s', i, util.inspect(row, {showHidden: false, depth: null}));
            //console.log(row);
            //
            // fieldNames are only used to configure web site field IDs
            fieldNames[i] = {
               clkPin   : row.sensorID + '_' + 'clkPin',
               dataPin  : row.sensorID + '_' + 'dataPin',
               scale    : row.sensorID + '_' + 'scaling',
               offset   : row.sensorID + '_' + 'offset',
               sensor   : row.sensorID,
               title    : "MOTOR " + row.sensorID
            }
         }
         console.log("ValueList => ", JSON.stringify(valueList));
         console.log("FieldNames => ", JSON.stringify(fieldNames));
      }
   )
};

//
// GET for Sensor Configuration site
//
// On sensor contains its pin configs (clk & data) and scale and offset values.
// clk & pdata pins are displayed in a combo box to give user a chance
// to select a hx711 sensor with it's wiringPi pins
// every time on web site four sensors are displayed (Motor 1-4)
//
exports.data_get = async function(req, res) {
   console.log("hx711SensorController.data_get(%s,%s)",req, res);
   console.log("call prepareData()...");
   await prepareData();
   console.log("read pinList & hx711 data");
   //res.json(pinList);
   console.log("pinList size(%d), configData size(%d), valueList size(%d)", 
      pinList.length, fieldNames.length, valueList.length);

   res.render('hx711Sensor', {
      title: 'Configure your HX711 Sensors', 
      pinList: pinList,
      configData : fieldNames,
      valueList : valueList
   });
};

//
// called if user click SAVE Button on web site
exports.data_post = function(req, res) {
   console.log("REQ:(", req.body);
   // we have to update 4 records - not more not less
   rows = [];
   row = {};
   id = 0;
   lastId = 1;
   Object.keys(req.body).sort().forEach(function(key) {
      id = key.split('_')[0];
      console.log("Current ID(", id ,") found in KEY (", key, ") isNaN(",id,"==",isNaN(id));
      if (isNaN(id) == false) {
         k = key.split('_')[1];
         v = req.body[key];
         console.log("a");
         if (id != lastId) {
            if (k !== null && v !== null && v.length > 0) {
               console.log("b (new ID :", id, ") lastId (", lastId,")");
               rows[lastId-1] = row;
               console.log("b (new ID :", id, " insert row (", row, ")");
               row={};
            }
         }
         console.log("c1 - set row");
         row[k] = v;
         lastId = id;
         console.log("c2 (", JSON.stringify(row), ")");
         console.log("(%d) Key (%s) Value (%s)", id, k, v);
         console.log("--- ", JSON.stringify(rows));
      } else {
         console.log("ignore %s - %s", key, req.body[key]);
      }
   })
   rows[lastId-1] = row
   console.log("ROWS(", JSON.stringify(rows), ")");
   id = 0;
   
   console.log("delete all configHX711Sensors");
   //
   // every time all sensor rows will be inserted as new values
   // befor we do this, all available records must be deleted
   Query("DELETE FROM configHX711Sensors");
   //
   // write new values
   rows.forEach(function(row) {
      id++;
      sql = "INSERT INTO configHX711Sensors (sensorID, clkPinId, dataPinId, scaling, offset) ";
      sql += "VALUES (" 
         + id + ", " 
         + row.clkPin + ", "
         + row.dataPin + ", "
         + row.scaling + ", "
         + row.offset + ");";
      console.log("(%o", row, ") row.clcPinId(", row.clkPin,")");
      console.log("SQL(%s)", sql);
      Query(sql);
   })
   
   console.log("data_post - save HX711SensorDB");
//   res.send("exports.data_post => this function not implemented yet ")
   // go back to main config site
   res.redirect("configChoose");
}


//
// GET for SensorCalibration web site
//
exports.calibrate_get = async function(req, res) {
   sD = req.body;
   console.log("calibrate_get =>> prepare WebSocket");
   InitializeHXSensors();
   res.render('hx711SensorCalibrate', {
      title: "HX711 Sensor Calibration"
   });
}

exports.calibrate_post = function(req, res) {
   sD = req.body;
   console.log("====>>> POST Polling : ", sD);
   hx711 = req.body;
   console.log("hx711(", hx711, ")");
   res.render("hx711SensorCalibrate");
}

exports.onUpdateClick_post = function(req, res) {
   hx711 = req.body;
   console.log("onClick_post : hx711(", hx711, ")");
}


//------------------------------------------------
// WebSocket handling
//------------------------------------------------
wss.on('connection', function(ws){
   ws.send("(HX711) WS Client connected", ws.address);  
   ws.on('message', function sendToAllClients(message) {
     wss.clients.foreach(function(client) {
       client.send(message);
     })
   })
   myWS = ws;
   setInterval(function timeout() {
      if (phyHX711List.length > 0) {
         // read for client output everytime first entry inside the queue
         // if no new value is available, we read the last inserted value again
         // if a new value was pushed into the queue, this new value is the first item
         // inside the queue.
         sD = hx711DataQueue.first();
         ws.send(JSON.stringify(sD));
         //console.log("send HX711SensorDataCollection....");
      }
      }, 10);
 });
 
 wss.on('open', function open() {
   console.log("wss.on(open)");
   //wss.send(HX711SensorDataCollection());
 })

function HX711SensorDataCollection() {
   //console.log("=> New HX711 Data message...");
   sD = {};
   sD.max = [
      //phyHX711List[0].getUnits(),
      //phyHX711List[1].getUnits(),
      //phyHX711List[2].getUnits(),
      //phyHX711List[3].getUnits()
      Math.floor(Math.random(100)*100),
      Math.floor(Math.random(100)*100),
      Math.floor(Math.random(100)*100),
      Math.floor(Math.random(100)*100)
   ]
   sD.min = [0,0,0,0];
   sD.avg = [0,0,0,0];
   /*
   sD.min = [
      phyHX711List[0].getUnits(),
      phyHX711List[1].getUnits(),
      phyHX711List[2].getUnits(),
      phyHX711List[3].getUnits()
   ]
   sD.avg = [
      phyHX711List[0].getUnits(),
      phyHX711List[1].getUnits(),
      phyHX711List[2].getUnits(),
      phyHX711List[3].getUnits()
   ]
   */
   //console.log("try to send websocket message ....");
   //myWS.send(JSON.stringify(sD));
   return sD;
} 

//------------------------------------------------
// HX711 Sensor handling
//------------------------------------------------

function InitializeHXSensors() {
   console.log("InitializeHXSensors.....")
   CreateSensorObjects.then((sensors) => {
      console.log("Got a list of sensors => ", sensors);
      phyHX711List = sensors;
      sensors.forEach((sensor,index,list) => {
         console.log("Sensor(", index, ") => ", typeof(sensor), " =>", sensor.read());
      });
   });
}

async function ReadHX711ValuesContinously (buffersize = 10) {

}