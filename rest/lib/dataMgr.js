// Dependencies
const fs = require("fs");
const path = require("path"); // Normalizes paths

const dataMgr = {};

// Set up base directory for data folder.
dataMgr.baseDir = path.join(
  __dirname,
  "/../.data"
); /* __dirname is a Node constant for current location. So, are normalizing with respect to that. */

// Write data to file
dataMgr.rite = function rite(dir, file, data, cb) {
  console.log(`${dataMgr.baseDir}/${dir}/${file}.json`);

  // Create file for writing
  fs.open(`${data.baseDir}/${dir}/${file}.json`, "wx", (err, fileDesc) => {
    if (err) {
      cb("Could not create file for writing. Does it already exist?");
      return;
    }

    /* We are passing in JSON data. It is converted to string for riting. Then, when we read it back out, we want JSON objects. */
    const dataStr = JSON.stringify(data);
    cb(dataStr);

    // Write dataStr to file and then close that file
    fs.writeFile(fileDesc, dataStr, riteErr => {
      if (riteErr) {
        cb("Error riting to new file");
        return;
      }

      /* Write was successful. Now close the file. */
      fs.close(fileDesc, closeErr => {
        if (closeErr) {
          cb("Error closing file!");
        }
      });
    });
  });
};

module.exports = dataMgr; // Export the container object.
