/**
   HX711 table structure model as an object
   (class hx711Sensors)

   and sensor values for all hx711 sensors
*/

//
// 
// read on hx711Sensor and return sensor object
module.exports.GetHX711Sensor = (id) => {
   return hx711Sensors.findOne({
      where: {
         id: id
      }
   });
}

// SQLITE
// read one record from pinList and return object
function GetPiPin(id) {
   return this.pinList.findOne({
      where: {
         id: id
      }
   });
}

// SQLITE
// create / define configHX711Sensors table
module.exports.hx711Sensors = (sequelize, type) => {
   return sequelize.define('configHX711Sensors', {
       id: {
         type: type.INTEGER,
         primaryKey: true,
         autoIncrement: true
       },
       sensorID:     type.INTEGER,
       clkPinId:     type.INTEGER,
       dataPinId:    type.INTEGER,
       scaling:      type.DECIMAL,
       offset:       type.DECIMAL,

      // Timestamps
      createdAt: type.DATE,
      updatedAt: type.DATE,

      })
}

// SQLITE
//
// this pinList contain GPIO-PinNumber and WiringPi Numbering
// for HX711 sensors we need WiringPi numbers
// Common use for most Pi users is using GPIO numbering
// so, we publish GPIO numbering on our config side but we use WiringPi numbering
// for configuring the HX711 sensor
module.exports.pinList = (sequelize, type) => {
   return sequelize.define('configPins', {
      id: {
         type: type.INTEGER,
         primaryKey: true,
         autoIncrement: true
      },
      wiringPi:     {
         type: type.INTEGER,
         allowNull : false
      },
      gpio: {
         type: type.INTEGER,
         allowNull : false
      },
      // Timestamps
      createdAt: type.DATE,
      updatedAt: type.DATE
      })
}

// 
//
// return real Raspberry PI- WiringPi-pins for Sensor(id)
module.exports.sensorPins = (id) => {
   clkId = dataId = -1;
   clkPin = dataPin = -1;
   console.log("a) Read hx711 (", id, ")");
   
   GetHX711Sensor(id).then(function(hx711){
      clkId = hx711.clkPinId;
      dataId = hx711.dataPinId;
      console.log("b) read hx711-clkPinId (", clkId, ")");
   });
   GetPiPin(clkPin).then(function(pin){
      clkPin = pin.clkPinId;
      console.log("c1) Pi-clkPin(", clkPin, ")");
   });  
   GetPiPin(clkPin).then(function(pin){
      dataPin = pin.clkPinId;
      console.log("c2) Pi-dataPin(", dataPin, ")");
   });  
   
   return [id, clkPin, dataPin];
}


