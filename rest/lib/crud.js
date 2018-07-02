// Dependencies
const fs = require("fs");
const path = require("path"); // Normalizes paths
const helpers = require("./helpers");

const crud = {};

// Set up base directory for data folder.
crud.baseDir = path.join(__dirname, "/../.data");

/**
 * Developer's Note: THIS WILL NOT CREATE THE DIRECTORY. THE DIRECTORY MUST ALREADY BE PRESENT. IT WILL ONLY CREATE THE FILE!
 */
crud.createRiteCloseFile = function createRriteCloseFile(dir, file, data, cb) {
  const filePath = `${crud.baseDir}/${dir}/${file}.json`;

  fs.open(filePath, "wx", err => {
    if (err) {
      console.log(err);
      cb("Could not create file for writing. Does it already exist?");
      return;
    }

    /**
     * We are passing in JSON data.
     * It is converted to string for riting.
     * Then, when we read it back out, we want JSON objects.
     */
    const dataStr = JSON.stringify(data);

    // Write dataStr to file and then close that file
    fs.writeFile(filePath, dataStr, riteErr => {
      if (riteErr) {
        cb("Error riting to new file");
        return;
      }

      cb(false); // If no error, then we just pass 'false.'
    });
  });
};

crud.readDataFile = function readFile(dir, file, cb) {
  fs.readFile(
    `${crud.baseDir}/${dir}/${file}.json`,
    "utf-8",
    (err, redData) => {
      if (!err && redData) {
        const parsedRedData = helpers.parseJSONtoObj(redData);
        cb(false, parsedRedData); // Pass 'false' b/c no error.
        return;
      }
      // If err, send back 'raw', unparsed data.
      cb(err, redData);
    }
  );
};

crud.updateFile = function updateFile(dir, file, data, cb) {
  const filePath = `${crud.baseDir}/${dir}/${file}.json`;

  /**
   * 'r+' opens for reading/writing.
   *  It generates an error if the file doesn't yet exist.
   */
  fs.open(filePath, "r+", err => {
    if (err) {
      cb("Could not open file for writing. Does it exist?", err);
      return;
    }

    // Again, turn the data into a string.
    const dataStr = JSON.stringify(data);

    // Truncate the file
    fs.truncate(filePath, truncErr => {
      if (truncErr) {
        cb(`Error truncating file: ${truncErr}`);
        return;
      }

      fs.writeFile(filePath, dataStr, riteErr => {
        if (riteErr) {
          cb(`Error riting file: ${riteErr}`);
          return;
        }

        // If no error, return false.
        cb(false);
      });
    });
  });
};

crud.deleteFile = function deleteFile(dir, file, cb) {
  fs.unlink(`${crud.baseDir}/${dir}/${file}.json`, err => {
    if (err) {
      cb(`Error deleting file: ${err}`);
    }
  });
};

module.exports = crud; // Export the container object.
