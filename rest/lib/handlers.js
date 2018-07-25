// Dependencies
const helpers = require("./helpers");
const crud = require("./crud");

// Handlers
const handlers = {};

handlers.users = {};
handlers.tokens = {};

// Users handler
handlers.users = function users(d, cb) {
  // Limit the types of requests users can make
  const { method } = d;

  // https://css-tricks.com/snippets/javascript/check-if-function-exists-before-calling/
  if (typeof handlers.users[method] !== "function") {
    cb(405);
    return;
  }
  handlers.users[method](d, cb);
};

// Tokens handler
handlers.tokens = function tokens(d, cb) {
  // Limit the types of requests users can make
  const { method } = d;

  // https://css-tricks.com/snippets/javascript/check-if-function-exists-before-calling/
  if (typeof handlers.tokens[method] !== "function") {
    cb(405);
    return;
  }
  handlers.tokens[method](d, cb);
};

// Other handlers
handlers.ping = function ping(d, cb) {
  cb(200);
};

// 404 handler
handlers.notFound = function notFound(d, cb) {
  cb(404); // no payload if 'bad' page
};

// Users
handlers.users.post = function post(d, cb) {
  const validatedData = helpers.validateData(d.reqPayload);

  // We check if validateData() returned any 'falses.'
  if (
    !validatedData.fname ||
    !validatedData.lname ||
    !validatedData.fone ||
    !validatedData.pword ||
    !validatedData.tos
  ) {
    cb(400, { Error: "Missing required fields!" }); // Should send back a data object - not just string.
    return;
  }

  /**
   * Make sure user doesn't already have a phone number data file.
   * We do this by trying to read their data file.
   */
  crud.readDataFile("users", validatedData.fone, (err, data) => {
    // If error reading, it means that the user doesn't already exist!
    if (err) {
      // Hash the password using 'crypto.'
      validatedData.pword = helpers.hash(validatedData.pword);

      // Make sure password got hashed
      if (!validatedData.pword) {
        cb(500, { Error: "Password didn't get hashed!" });
        return;
      }

      // Store the newly created user in their own JSON file within 'users' directory.
      crud.createRiteCloseFile(
        "users",
        validatedData.fone,
        validatedData,
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
  const { fone } = helpers.validateData(d.queryStringObj);

  if (!fone) {
    cb(400, { Error: "Missing fone!" });
    return;
  }

  // Valid fone number received
  crud.readDataFile("users", fone, (err, data) => {
    if (err || !data) {
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
 * PUT is an 'update'.
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
    return;
  }
  if (validatedData.fname || validatedData.lname || validatedData.pword) {
    // Verify that we have an existing user
    crud.readDataFile("users", validatedData.fone, (err, udata) => {
      if (err || !udata) {
        // Sending back 400 instead of 404 for better feedback on a PUT.
        cb(400, { Error: "User not found!" });
        return;
      }

      /**
       * Now that we know we have a valid user, let's clean up the validatedData in prepartion to 'merge'/overwrite some data.
       */
      Object.entries(validatedData).forEach(entry => {
        if (entry[1] === false) {
          delete validatedData[entry[0]];
        }
      });

      /**
       *  If we are changing a password, let's be sure to hash that first before updating.
       */
      if (validatedData.pword) {
        validatedData.pword = helpers.hash(validatedData.pword);
      }

      // We are ready to merge/update the data.
      const updatedUdata = { ...udata, ...validatedData };

      // Store the updates
      crud.updateFile("users", validatedData.fone, updatedUdata, updateErr => {
        if (updateErr) {
          cb(500, { Error: "Error while updating user data!" });
          return;
        }
        cb(200);
      });
    });
  } else {
    cb(400, { Error: "Missing information to update!" });
  }
};

handlers.users.delete = function del(d, cb) {
  const { fone } = helpers.validateData(d.queryStringObj);

  if (!fone) {
    cb(400, { Error: "Missing fone!" });
    return;
  }

  // Make sure user exists
  crud.readDataFile("users", fone, (err, data) => {
    if (err || !data) {
      cb(400, { Error: "Could not find specified user!" });
      return;
    }

    // Try to delete users
    crud.deleteFile("users", fone, delErr => {
      if (delErr) {
        cb(500, { Error: "Could not delete specified user!" });
        return;
      }

      cb(200);
    });
  });
};

// Tokens
handlers.tokens.post = function post(d, cb) {
  // Validate phone and password from token
  const validatedData = helpers.validateData(d.reqPayload);

  if (!validatedData.fone || !validatedData.pword) {
    cb(400, { Error: "Missing required fields!" }); // Should send back a data object - not just string.
    return;
  }

  // Lookup user by fone number
  crud.readDataFile("users", validatedData.fone, (err, udata) => {
    if (err || !udata) {
      cb(400, { Error: "User not found!" });
      return;
    }

    // If user exists, we can proceed with hashing and comparing passwords.
    const hashedPword = helpers.hash(validatedData.pword);
    if (hashedPword !== udata.pword) {
      cb(404, { Error: "Not authorized!" });
      return;
    }

    /**
     *  If user is validated with password,
     * we can create a token.
     *
     * We will set it for 1 hour into the future...the future...the future......
     */
    const tokenID = helpers.createTokenID(20);
    if (!tokenID) {
      cb(500, { Error: "Token not created!" });
      return;
    }

    // 1 hour = 1 second * 60 seconds / min * 60 min / hour
    const tokenIDExp = Date.now() + 1000 * 60 * 60;

    /**
     * If we successfully generated a tokenID,
     * let's build a token obj
     * that will contain all of the spit we need.
     */
    const tokenObj = {
      fone: validatedData.fone,
      id: tokenID,
      expires: tokenIDExp
    };

    // Store this object inside 'tokens' folder under .data.
    crud.createRiteCloseFile("tokens", tokenID, tokenObj, createTokenErr => {
      if (createTokenErr) {
        cb(500, { Error: "Error writing token to file!" });
        return;
      }

      cb(200, tokenObj);
    });
  });
};

/**
 * Validate an incoming token.
 * This is similar to validating fone number from users' GET handler.
 */
handlers.tokens.get = function get(d, cb) {
  const { id } = helpers.validateData(d.queryStringObj);

  if (!id) {
    cb(400, { Error: "Missing or bad token ID data!" });
    return;
  }

  // Valid id received
  crud.readDataFile("tokens", id, (err, data) => {
    if (err || !data) {
      cb(404); // Token not found!
      return;
    }

    cb(200, data);
  });
};

/**
 * PUT used to extend token's expiration.
 * We only accept a 'true' for extend request from user.
 * Then, token is extended by 1 hour.
 */
handlers.tokens.put = function put(d, cb) {
  // USES PAYLOAD, NOT queryStringObj!!!
  const { id, extend } = helpers.validateData(d.reqPayload);

  if (!id || !extend) {
    cb(400, { Error: "Missing required fields and/or invalid fields!" });
    return;
  }

  crud.readDataFile("tokens", id, (err, data) => {
    if (err || !data) {
      cb(400, { Error: "Token is not valid!" });
      return;
    }

    // Grab current expiration from
    let { expires } = data;

    // Cannot extend an expired token!
    if (expires <= Date.now()) {
      cb(400, { Error: "Expired token!" });
      return;
    }
    console.log(expires);
    expires = Date.now() + 1000 * 60 * 60;
    console.log(expires);
    const extendedToken = { ...data, expires };

    console.log(extendedToken.expires);

    crud.updateFile("tokens", extendedToken.id, extendedToken, updateErr => {
      if (updateErr) {
        cb(500, { Error: "Error while extending token!" });
        return;
      }

      cb(200);
    });
  });
};

handlers.tokens.delete = function del(d, cb) {
  const { id } = helpers.validateData(d.queryStringObj);

  if (!id) {
    cb(400, { Error: "Missing token id!" });
  }

  crud.readDataFile("tokens", id, (err, data) => {
    if (err || !data) {
      cb(400, { Error: "Could not find specified token!" });
      return;
    }

    crud.deleteFile("tokens", id, delErr => {
      if (delErr) {
        cb(500, { Error: "Could not delete specified token!" });
        return;
      }

      cb(200);
    });
  });
};

module.exports = handlers;
