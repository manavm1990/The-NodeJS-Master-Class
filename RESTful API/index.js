const http = require("http");
const url = require("url");

/* Server to respond to all requests with a string
  Req and resp are brand new each time the server is hit.
  Req contains much information about what user is asking for.
*/
const server = http.createServer((req, resp) => {
  /* Get the URL and parse it
    true indicates that we want to also use the query string module...    
  */
  const parsedURL = url.parse(req.url, true);

  // Get the path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get the HTTP method
  const method = req.method.toUpperCase();

  // Send response
  resp.end("Hello World\n");

  // Log it!
  console.log(
    `Request received on path: ${trimmedPath}. The method is: ${method}.`
  );
});

/* Start server, listening on 3000.
  Here is the 'constantly running task' for NodeJS Event Loop. */
server.listen(3000, () => {
  console.log("We are on port 3000!");
});
