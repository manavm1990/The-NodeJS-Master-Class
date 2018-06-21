// Dependencies

// Handlers
const handlers = {};

  dataMgr.readDataFile("users", fone, (err, data) => {
handlers.ping = function ping(d, cb) {
  /* This passes no data. So, as seen below, it will default to an empty object. */
  cb(200);
};

// 404 handler
handlers.notFound = function notFound(d, cb) {
  cb(404); // no payload if 'bad' page
};

// Users handler

module.exports = handlers;
