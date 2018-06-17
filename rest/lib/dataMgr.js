// Dependencies
const fs = require("fs");
const path = require("path"); // Normalizes paths

const dataMgr = {};

// Set up base directory for data folder.
dataMgr.baseDir = path.join(__dirname, "/../.data");

/* Developer's Note: THIS WILL NOT CREATE THE DIRECTORY. THE DIRECTORY MUST ALREADY BE PRESENT. IT WILL ONLY CREATE THE FILE! */
dataMgr.createWriteCloseFile = function createWriteCloseFile(
  dir,
  file,
  data,
  cb
) {
  console.log("createFile called!");
  fs.open(`${dataMgr.baseDir}/${dir}/${file}.json`, "wx", (err, fileDesc) => {
    if (err) {
      console.log(err);
      cb("Could not create file for writing. Does it already exist?");
      return;
    }

    console.log("got the file created and opened for riting. :)");

    /* We are passing in JSON data. It is converted to string for riting. Then, when we read it back out, we want JSON objects. */
    const dataStr = JSON.stringify(data);
    cb(dataStr); // This is 'matched up' with riteResults in index.js

    // Write dataStr to file and then close that file
    fs.writeFile(fileDesc, dataStr, riteErr => {
      if (riteErr) {
        cb("Error riting to new file");
        return;
      }

      console.log("Rote to file! :)");

      /* Write was successful. Now close the file. */
      fs.close(fileDesc, closeErr => {
        if (closeErr) {
          cb("Error closing file!");
        }
      });
    });
  });
};

dataMgr.readFile = function readFile(dir, file, cb) {
  fs.readFile(
    `${dataMgr.baseDir}/${dir}/${file}.json`,
    "utf-8",
    (err, redData) => {
      cb(err, redData);
    }
  );
};

module.exports = dataMgr; // Export the container object.
