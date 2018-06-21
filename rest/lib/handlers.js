// Dependencies
const helpers = require("./helpers");
const crud = require("./crud");

// Handlers
const handlers = {};

handlers.users = {};

// Users handler
handlers.users = function users(d, cb) {
  // Limit the types of requests users can make
  const accMethodTypes = ["get", "post", "put", "delete"];

  const currMethodType = d.method.toLowerCase();

  if (accMethodTypes.indexOf(currMethodType) === -1) {
    // -1 means that it was not found (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
    cb(405);
    return;
  }

  handlers.users[currMethodType](d, cb);
};

handlers.users.post = function getHandler(d, cb) {
  // Grab trimmed fields
  const fname = d.payload.fname.trim();
  const lname = d.payload.lname.trim();
  const fone = d.payload.fone.trim();
  const pword = d.payload.pword.trim();
  const tos = d.payload.tos.trim();

  // Server-side validation
  const validatedFname =
    typeof fname === "string" && fname.length > 0 ? fname : false;
  const validatedLname =
    typeof lname === "string" && lname.length > 0 ? lname : false;
  const validatedFone =
    typeof fone === "string" && fone.length === 10 ? fone : false;
  const validatedPword =
    typeof password === "string" && pword.length > 0 ? pword : false;
  const validatedTos = typeof tos === "boolean" && tos === true ? tos : false;

  if (
    !validatedFname ||
    !validatedLname ||
    !validatedFone ||
    !validatedPword ||
    !validatedTos
  ) {
    cb(400, { Error: "Missing required fields!" }); // Should send back a data object - not just string.
    return;
  }

  /**
   *  Make sure user doesn't already have a phone number data file.
   * We do this by trying to read their data file.
   */
  crud.readDataFile("users", validatedFone, (err, data) => {
    // If error reading, it means that the user doesn't already exist!
    if (err) {
      // Hash the password using 'crypto.'
      const hashedPword = helpers.hash(validatedPword);

      // Make sure password got hashed
      if (!hashedPword) {
        cb(500, { Error: "Password didn't get hashed!" });
        return;
      }

      // Create user object
      const userObj = {
        fname: validatedFname,
        lname: validatedLname,
        fone: validatedFone,
        pword: hashedPword
      };

      // Store the newly created user in their own JSON file witin 'users' directory.
      crud.createRiteCloseFile(
        "users",
        validatedFone,
        userObj,
        createUserErr => {
          if (createUserErr) {
            console.log(`Error creating the new user: ${err}`);
            cb(500, { Error: "Unable to create the new user!" });
            return;
          }

          cb(200);
        }
      );
    } else {
      cb(400, { Error: "User already exists!" });
    }
  });
};
handlers.users.post = function get(d, cb) {};
handlers.users.put = function get(d, cb) {};
handlers.users.delete = function get(d, cb) {};

handlers.ping = function ping(d, cb) {
  cb(200);
};

// 404 handler
handlers.notFound = function notFound(d, cb) {
  cb(404); // no payload if 'bad' page
};

module.exports = handlers;
