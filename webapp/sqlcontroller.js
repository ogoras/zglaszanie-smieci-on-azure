const { Connection, Request, TYPES } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "zglaszanie-smieci-server-admin", // update me
      password: "V3ryS4f3P4ssw0rd" // update me
    },
    type: "default"
  },
  server: "zglaszanie-smieci-server.database.windows.net", // update me
  options: {
    database: "zglaszanie-smieci-db", //update me
    encrypt: true
  }
};

// Attempt to connect and execute queries if connection goes through
addReport('Warsaw', (id) => {
  console.log("ID: " + id);
});
addReport('Lodz', (id) => {
  console.log("ID: " + id);
},
0);
addReport('Katowice', (id) => {
  console.log("ID: " + id);
},
1);

function addReport(coordinates, callback, state = 0) {
  const connection = new Connection(config);

  connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else {
      var id;
      const request = new Request(
        `INSERT INTO LitterReportsTable (ReportState, Coordinates) OUTPUT INSERTED.Id VALUES (@ReportState, @Coordinates);`,
        (err) => {
          if (err) {
            console.error(err.message);
          }
        }
      );
      request.addParameter('ReportState', TYPES.Int, state);
      request.addParameter('Coordinates', TYPES.NVarChar, coordinates);

      request.on("row", columns => {
        columns.forEach(column => {
          if (column.value === null) {
            console.log(NULL);
          } else {
            console.log("Id of inserted point is " + column.value);
            callback(column.value);
          }
        });
      });

      connection.execSql(request);
    }
  });

  connection.connect();
}

function removeReport(id) {

}

function updateReport(id, state, coordinates = undefined){

}

function getReport(id, callback) {

}

function getAllReports(callback) {

}

module.exports() = {
  addReport,
  removeReport,
  updateReport,
  getReport,
  getAllReports
}