const crypto = require("crypto");
const config = require("./config");

const helpers = {};

// SHA256
helpers.hash = function hash(str) {
  if (typeof str !== "string" || !str.length > 0) {
    return false;
  }

  // Hash the string and return it.
  const hash256 = crypto.createHmac("SHA256", config.secret);
  hash256.update(str); // https://nodejs.org/api/crypto.html#crypto_hmac_update_data_inputencoding
  hash256.digest("hex"); // https://nodejs.org/api/crypto.html#crypto_hmac_digest_encoding

  return hash256;
};

/**
 * Change string into JSON object or return 'false.'
 * This is basically just wrapping JSON.parse in a try-catch.
 */
helpers.parseJSONtoObj = function parseJSONtoObj(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return {};
  }
};

helpers.validateData = function validateData(d) {
  let { fname, lname, fone, pword, tos } = d;

  fname = typeof fname === "string" && fname.trim().length > 0 ? fname : false;
  lname = typeof lname === "string" && lname.trim().length > 0 ? lname : false;
  fone = typeof fone === "string" && fone.trim().length === 10 ? fone : false;
  pword = typeof pword === "string" && pword.trim().length > 0 ? pword : false;
  tos = typeof tos === "boolean" && tos === true ? tos : false;

  return {
    fname,
    lname,
    fone,
    pword,
    tos
  };
};

helpers.createTokenID = function createTokenID(len) {
  crypto.randomBytes(len, (err, buff) => {
    if (err) {
      return false;
    }

    return buff;
  });
};

module.exports = helpers;
