// Dependencies
const fs = require("fs");
const path = require("path"); // Normalizes paths

const dataMgr = {};

// Set up base directory for data folder.
dataMgr.baseDir = path.join(__dirname, "/../.data");

/* Developer's Note: THIS WILL NOT CREATE THE DIRECTORY. THE DIRECTORY MUST ALREADY BE PRESENT. IT WILL ONLY CREATE THE FILE! */
dataMgr.createRiteCloseFile = function createRriteCloseFile(
  dir,
  file,
  data,
  cb
) {
  const filePath = `${dataMgr.baseDir}/${dir}/${file}.json`;

  fs.open(filePath, "wx", err => {
    if (err) {
      console.log(err);
      cb("Could not create file for writing. Does it already exist?");
      return;
    }

    /* We are passing in JSON data. It is converted to string for riting. Then, when we read it back out, we want JSON objects. */
    const dataStr = JSON.stringify(data);

    // Write dataStr to file and then close that file
    fs.writeFile(filePath, dataStr, riteErr => {
      if (riteErr) {
        cb("Error riting to new file");
        return;
      }

      cb(dataStr); // This is 'matched up' with riteResults in index.js
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

dataMgr.updateFile = function updateFile(dir, file, data, cb) {
  /* 'r+' opens for reading/writing. It generates an error if the file doesn't yet exist. */
    if (err) {
      console.log(err);
      cb("Could not open file for writing. Does it exist?");
      return;
    }

    /* Again, turn the data into a string. */
    const dataStr = JSON.stringify(data);

    /* TODO -- Passing a file descriptor is deprecated and may result in an error being thrown in the future.

    https://nodejs.org/api/fs.html#fs_fs_truncate_path_len_callback */

    // Truncate the file
    fs.truncate(fd, truncErr => {
      if (truncErr) {
        cb(`Error truncating file: ${truncErr}`);
        return;
      }

      fs.writeFile(fd, dataStr, riteErr => {
        if (riteErr) {
          cb(`Error riting file: ${riteErr}`);
          return;
        }
        fs.close(fd, closeErr => {
          cb(closeErr);
        });
      });
    });
  });
};

dataMgr.deleteFile = function deleteFile(dir, file, cb) {
  fs.unlink(`${dataMgr.baseDir}/${dir}/${file}.json`, err => {
    cb(`Error deleting file: ${err}`);
  });
};

module.exports = dataMgr; // Export the container object.
