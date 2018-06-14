const http = require("http");
const url = require("url");
const StrDecoder = require("string_decoder").StringDecoder; // Constructors should start with capital

// Handlers
const handlers = {};

// Test Handler
handlers.test = function handlerTestFxn(data, cb) {
  cb(406, { name: "test" }); // Pass a status code and payload object.
};

// 404 Handler
handlers.notFound = function handler404Fxn(data, cb) {
  cb(404); // no payload if 'bad' page
};

// Request router
const router = {
  test: handlers.test
};

/* Server to respond to all requests with a string.
  Req and resp are brand new each time the server is hit.
  Req contains much information about what user is asking for.
*/
const server = http.createServer((req, resp) => {
  /* Get the URL and parse it
    true indicates that we want to also use the query string module.
    This will allow us to parse the query and get it as Object with name/values.
  */
  const parsedURL = url.parse(req.url, true);

  // Get the path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get query string as an Object
  const queryStringObj = parsedURL.query;

  // Get the HTTP method
  const method = req.method.toUpperCase();

  // Get the headers from user request
  const { headers } = req;

  // Process any payload
  /* We create a 'payload buffer', which will get appended by the strDecoder. */
  const decoder = new StrDecoder("utf-8");
  let payloadBuffer = "";

  /* Each time data is received (if any) via the Node stream, append payloadBuffer. */
  req.on("data", data => {
    payloadBuffer += decoder.write(data); // Decoder writes whatever data is as utf-8.
  });

  // Watch for end of stream
  req.on("end", () => {
    payloadBuffer += decoder.end();

    // Find correct handler fxn. by checking to see if our path matches any route
    const handlerFxn =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    const data = {
      trimmedPath,
      queryStringObj,
      method,
      headers,
      reqPayload: payloadBuffer
    };

    handlerFxn(data, (statusCode, respPayload) => {
      /* We need to set defaults for statusCode and payloadObj, in case we don't get anything for those values back from the handler. 
      
      See if statusCode is, in fact, a number - e.g. an actual non-blank status code sent back from handler. If it is, use it, otherwise set it to 200.
      */
      const verifiedStatusCode =
        typeof statusCode === "number" ? statusCode : 200;

      /* Similar to above, verify the payload is a valid object. */
      const verifiedPayload =
        typeof respPayload === "object" ? respPayload : {};

      const verifiedPayloadStr = JSON.stringify(verifiedPayload);

      resp.writeHead(verifiedStatusCode);
      resp.end(verifiedPayloadStr);

      console.log(
        `Here's the response: ${verifiedStatusCode} and ${verifiedPayloadStr}`
      );
    });
  });
});

/* Start server, listening on 3000.
  Here is the 'constantly running task' for NodeJS Event Loop. */
server.listen(3000, () => {
  console.log("Listening on port 3000!");
});
