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

handlers.users.post = function postHandler(d, cb) {
  const { validatedFname, validatedLname, validatedFone, validatedPword, validatedTos } = helpers.validateData(d.reqPayload);

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
   * Make sure user doesn't already have a phone number data file.
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
        pword: hashedPword,
        tos: validatedTos
      };

      // Store the newly created user in their own JSON file witin 'users' directory.
      crud.createRiteCloseFile(
        "users",
        validatedFone,
        userObj,
        createUserErr => {
          if (createUserErr) {
            console.log(`Error creating the new user: ${createUserErr}`);
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

// GETs are allowed for authenticated users to access their own object.
handlers.users.get = function get(d, cb) {
  /**
   *  Verify that the fone number is valid.
   * Since this is a GET, we are working with queryStringObj, not reqPayload.
   * GET doesn't have payloads.
   */
  const { validatedFone } = helpers.validateData(d.queryStringObj);

  if (!validatedFone) {
    cb(400, { Error: "Missing fone!" });
    return;
  }
  
  // Valid fone number received
  crud.readDataFile("users", validatedFone, (err, data) => {
    if (err) {
      cb(404); // User not found!
      return;
    }
    // Remove hashedPword from the data object before returning
    const redData = data;
    delete redData.pword;
    cb(200, redData);
  });
};

/**
 *  PUT is an 'update'.
 * It uses payload, like POST.
 */
handlers.users.put = function put(d, cb) {
  const validatedData = helpers.validateData(d.reqPayload);

  /**
   *  We continue ONLY If
   *  we have a valid fone AND
   *  at least one other piece of data for updating.
   */
  if (!validatedData.fone) {
    cb(400, { Error: "Missing fone!" });
  } else if (
    !validatedData.fname ||
    !validatedData.lname ||
    !validatedData.pword
  ) {
    cb(400, { Error: "Missing information to update!" });
    return;
  }

  // Valid fone number received
  crud.updateFile('users', validatedFone, d, )
};

handlers.users.delete = function del(d, cb) {}; // Developer's Note: Unable to name this 'delete'...

handlers.ping = function ping(d, cb) {
  cb(200);
};

// 404 handler
handlers.notFound = function notFound(d, cb) {
  cb(404); // no payload if 'bad' page
};

module.exports = handlers;
