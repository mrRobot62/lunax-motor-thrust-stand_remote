const Sequelize = require('sequelize');
const HX711SensorModel = require('../models/config/hx711SensorModel');

var phyHX711Sensors = [];


const sequelize = new Sequelize({
   dialect : 'sqlite',
   storage : 'db/fpv_mts.db'
});

//-----------------------------------------------------------------------------------------
// Check only if connection to database can be established
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

/*
sequelize
  .query("select name from sqlite_master where type='table' and name not like 'sqlite_%'")
  .then(([results, metadata]) => {
    console.log(results);
  });
*/

//-----------------------------------------------------------------------------------------
// Publish HX711 configuration objects
const HX711SensorDB = HX711SensorModel.hx711Sensors(sequelize, Sequelize);
const PiPinList = HX711SensorModel.pinList(sequelize,Sequelize); 
//
// return the real WiringPi Pins for Sensor(id)
// return: [id, wirinpi, gpio]
function HX711SensorPins(id) {
  return HX711SensorModel.sensorPins(id);
}


async function Query(sql) {
  sequelize.query(sql).then(([results, metadata]) => {
    //console.log("YEAHHH VIEW : ", results) 
    lastResults = results;
  })
}

//
// call view GetHXPins
//
// returns a list of all HX711 sensors with
//    => [{ sensorID: 1,scaling: 180,offset: 10,wPiclkPin: 21,wPidataPin: 22 }, ... ]
// for four records
GetHXPins = async (callback) => {
  sequelize.query("SELECT * FROM GetHXPins").then(([results, metadata]) => {
    // console.log("YEAHHH VIEW : ", results, " length: ", results.length);
    if (results.length > 0) {
      callback(results, null);
    } else {
      callback(
        null, 
        new Error("no HX711 sensors available - please call configuration")
      );
    }
  })
}

GetHXPins2 = () => {
  return sequelize.query("SELECT * FROM GetHXPins");
}

module.exports = {
  HX711SensorDB,
  PiPinList,
  Query,
  HX711SensorPins,
  GetHXPins,
  GetHXPins2
}

//-----------------------------------------------------------------------------------------
// Publish
