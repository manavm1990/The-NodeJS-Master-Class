const http = require("http");
const url = require("url");
const StrDecoder = require("string_decoder").StringDecoder; // Constructors should start with capital

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

    // Once payloadBuffer is 'ended', we can proceed with what else we need to do.
    // Send response
    resp.end("Hello World\n");

    // Log it!
    console.log(
      //   `Request received on path: ${trimmedPath}. The method is: ${method}. The query string parameters are: ${JSON.stringify(
      //     queryStringObj
      //   )}.

      // The headers are: ${JSON.stringify(headers, null, 1)}.

      `Here's the payload: ${payloadBuffer}`
    );
  });
});

/* Start server, listening on 3000.
  Here is the 'constantly running task' for NodeJS Event Loop. */
server.listen(3000, () => {
  console.log("Listening on port 3000!");
});
