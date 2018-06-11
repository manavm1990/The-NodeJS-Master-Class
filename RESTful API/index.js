const http = require("http");

// Server to respond to all requests with a string
const server = http.createServer((req, resp) => {
  resp.end("Hello World\n");
});

/* Start server, listening on 3000.
  Here is the 'constantly running task' for NodeJS Event Loop. */
server.listen(3000, () => {
  console.log("We are on port 3000!");
});
