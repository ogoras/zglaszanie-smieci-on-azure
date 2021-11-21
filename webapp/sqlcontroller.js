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
//removeReport(3);

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
  const connection = new Connection(config);

  connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else {
      const request = new Request(
        `DELETE FROM LitterReportsTable WHERE Id=@Id;`,
        (err) => {
          if (err) {
            console.error(err.message);
          }
        }
      );
      request.addParameter('Id', TYPES.Int, id);

      connection.execSql(request);
    }
  });

  connection.connect();
}

function updateReport(id, state, coordinates = undefined){
  const connection = new Connection(config);

  connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else if (coordinates == undefined) {
      const request = new Request(
        `UPDATE LitterReportsTable SET ReportState = @ReportState WHERE Id = @Id;`,
        (err) => {
          if (err) {
            console.error(err.message);
          }
        }
      );
      request.addParameter('Id', TYPES.Int, id);
      request.addParameter('ReportState', TYPES.Int, state);

      connection.execSql(request);
    } else {
      const request = new Request(
        `UPDATE LitterReportsTable SET ReportState = @ReportState, Coordinates = @Coordinates WHERE Id = @Id;`,
        (err) => {
          if (err) {
            console.error(err.message);
          }
        }
      );
      request.addParameter('Id', TYPES.Int, id);
      request.addParameter('ReportState', TYPES.Int, state);
      request.addParameter('Coordinates', TYPES.NVarChar, coordinates);

      connection.execSql(request);
    }
  });

  connection.connect();
}

function getReport(id, callback) {

}

function getAllReports(callback) {
  const connection = new Connection(config);

  connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else {
      var id;
      const request = new Request(
        `SELECT * FROM LitterReportsTable`,
        (err) => {
          if (err) {
            console.error(err.message);
          }
        }
      );
      
      const points_list = [];

      request.on("row", columns => {
        const properties = [];

        columns.forEach(column => {
          if (column.value === null) {
            properties[properties.length] = undefined;
          } else {
            properties[properties.length] = column.value;
          }
        });
        points_list[points_list.length] = {id:properties[0], state:properties[1], coordinates:properties[2]};
      });

      request.on("requestCompleted", () => {
        callback(points_list);
      })


      connection.execSql(request);
    }
  });

  connection.connect();
}

module.exports = {
  addReport,
  removeReport,
  updateReport,
  getReport,
  getAllReports
}