module.exports = class RecordFetch {
  constructor(base) {
    this.base = base;
  }

  // Airtable functions

  async getAllRecords() {
    let allRecords = [];

    // get records from airtable (Table 1, Grid View)
    return new Promise((res, rej) => {
      this.base("Table 1")
        .select({
          view: "Grid view",
        })
        .eachPage(
          function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.

            records.forEach(function (record) {
              console.log("Retrieved record", record.id);
              allRecords.push(record.id);
            });

            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              return rej(err);
            }
            res(allRecords);
          }
        );
    });
  }

  async addRecord(cookies) {
    return new Promise((res, rej) => {
      this.base("Table 1").create(
        {
          gid: cookies._gid,
          ga: cookies._ga,
          JSESSION_ID: cookies.JSESSIONID,
        },
        function (err, record) {
          if (err) {
            return rej(err);
          }
          console.log("Created new record: \n", record);
          res(record);
        }
      );
    });
  }

  async deleteRecords(records) {
    return new Promise((res, rej) => {
      this.base("Table 1").destroy(records, function (err, deletedRecords) {
        if (err) {
          rej(err);
        }
        console.log("Deleted " + deletedRecords.length + " records");
        res(deletedRecords);
      });
    });
  }

  async updateRecord(recordID, cookies) {
    return new Promise((res, rej) => {
      this.base("Table 1").update(
        [
          {
            id: recordID,
            fields: {
              gid: cookies._gid,
              ga: cookies._ga,
              JSESSION_ID: cookies.JSESSIONID,
            },
          },
        ],
        function (err, records) {
          if (err) {
            console.error(err);
            res(err);
          }

          console.log("Updated the following records: \n", records);
          res(records);
        }
      );
    });
  }
};
