const sqlite3 = require('sqlite3').verbose();
const DBFILE = "data/fpv_mts.db";


let db = new sqlite3.Database(DBFILE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to %s SQlite database.', DBFILE);
});

function RemoveAllRunSetupsCascase() {

}

function NewRunSetup() {
	
}

function NewRun() {

}

function NewMeasurements() {

}



db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});