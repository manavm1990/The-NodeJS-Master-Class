const crypto = require("crypto");
const config = require("./config");

const helpers = {};

// SHA256
helpers.hash = function hash(str) {
  if (typeof str !== "string" || !str.length > 0) {
    return false;
  }

  const hash256 = crypto.createHmac("SHA256", config.secret);
  hash256.update(str); // https://nodejs.org/api/crypto.html#crypto_hmac_update_data_inputencoding
  return hash256.digest("hex"); // https://nodejs.org/api/crypto.html#crypto_hmac_digest_encoding
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
  let { fname, lname, fone, pword, tos, id, expires, extend } = d;

  fname =
    typeof fname === "string" && fname.trim().length > 0 ? fname.trim() : false;
  lname =
    typeof lname === "string" && lname.trim().length > 0 ? lname.trim() : false;
  fone =
    typeof fone === "string" && fone.trim().length === 10 ? fone.trim() : false;
  pword =
    typeof pword === "string" && pword.trim().length > 0 ? pword.trim() : false;
  tos = typeof tos === "boolean" && tos === true ? tos : false;
  id = typeof id === "string" && id.trim().length === 40 ? id : false;
  expires = typeof expires === "number" ? expires : false;
  extend = extend === true ? extend : false;

  return {
    fname,
    lname,
    fone,
    pword,
    tos,
    id,
    expires,
    extend
  };
};

helpers.createTokenID = function createTokenID(len) {
  const validatedLen = typeof len === "number" && len > 0 ? len : false;

  if (!validatedLen) {
    return false;
  }

  return crypto.randomBytes(validatedLen).toString("hex");
};

module.exports = helpers;
