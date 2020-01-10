//--------------------------------------------------
// CLIENT script
//--------------------------------------------------
//
// WebSockets -------------------------------------

const ws = new WebSocket('ws://192.168.0.103:3003');

ws.onerror=function(err) {
   console.error('failed to make a websocket connection');
}

ws.onopen = function() {
   console.log('websocket connection established');
}

/**
 * Populate HX711 sensor data on client browser
 * 
 */
ws.onmessage = function(event) {
   search   = ["#M1", '#M2', '#M3', '#M4'];
   max      = ['#max_1','#max_2','#max_3','#max_4'];
   min      = ['#min_1','#min_2','#min_3','#min_4'];
   avg      = ['#avg_1','#avg_2','#avg_3','#avg_4'];
   try {
      sD = JSON.parse(event.data);
      console.log("WebSocket message: (", sD, ")");
      if (sD.max != undefined) {
         for (i = 0; i < search.length;i++) {
            $(search[i]).find(max[i]).val(sD.max[i]);
            $(search[i]).find(min[i]).val(sD.min[i]);
            $(search[i]).find(avg[i]).val(sD.avg[i]);
         }
      }
   } 
   catch(err) {
      console.warn("can't parse (", event.data, ")");
      //console.error(err);
   }
}



// ------------------------------------------------

function onReset(id) {
   console.log("onReset(", id, ")");


}

//
// data = {id:<sensorid>, scale:<scaling>, offset:<offset>}
function onUpdate(id) {
   console.log("onUpdate(", id, ")");
   //
   // initalize data array
   search = "#M" + id;
   scale = "#scale_" + id;
   offset = "#offset_" + id;
   sD = {};
   sD.id = id;
   sD.scale = $(search).find(scale).val();
   sD.offset = $(search).find(offset).val();
   console.log("onUpdate - search table(", search, ") - data: ", JSON.stringify(sD));
   request = $.ajax(
      {url:'/hx711SensorCalibrate/' + id,
      type:'POST', 
      data:sD});
   
   request.done(function() {
      window.location.href = "/";
   });

   request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });


}

$(document).ready(function() {
   //setTimeout(ReadyForData, 50);
});






