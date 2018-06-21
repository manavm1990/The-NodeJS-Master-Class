const crypto = require("crypto");

const helpers = {};

// SHA256
helpers.hash = function hash(str) {
  /* No cb fxn. Instead, it actually returns the value (instead of calling back). */
  if (typeof str !== "string" || !str.length > 0) {
    return false;
  }

  // Hash the string and return it.
  const hash256 = crypto.createHmac("SHA256");
  hash256.update(str); // https://nodejs.org/api/crypto.html#crypto_hmac_update_data_inputencoding
  hash256.digest("hex"); // https://nodejs.org/api/crypto.html#crypto_hmac_digest_encoding

  return hash256;
};

module.exports = helpers;