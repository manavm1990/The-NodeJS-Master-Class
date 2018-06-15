const http = require("http");
const https = require("https");
const url = require("url");
const StrDecoder = require("string_decoder").StringDecoder; // Constructors should start with capital
const fs = require("fs");
const config = require("./config");

// Handlers
const handlers = {};

handlers.ping = function ping(data, cb) {
  cb(200);
};

// 404 Handler
handlers.notFound = function notFound(data, cb) {
  cb(404); // no payload if 'bad' page
};

// Request router
const router = {
  ping: handlers.ping
};

const fullServer = function fullServer(req, resp) {
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
      const verifiedStatusCode =
        typeof statusCode === "number" ? statusCode : 200;

      const verifiedPayload =
        typeof respPayload === "object" ? respPayload : {};

      const verifiedPayloadStr = JSON.stringify(verifiedPayload);

      resp.setHeader("Content-Type", "application/json");
      resp.writeHead(verifiedStatusCode);
      resp.end(verifiedPayloadStr);

      console.log(
        `Here's the response: ${verifiedStatusCode} and ${verifiedPayloadStr}`
      );
    });
  });
};

const httpServer = http.createServer((req, resp) => {
  fullServer(req, resp);
});

httpServer.listen(config.httpPort, () => {
  console.log(`Listening on port: ${config.httpPort}`);
});

const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};

const httpsServer = https.createServer(httpsServerOptions, (req, resp) => {
  // httpsServerOptions will have the cert and key information
  fullServer(req, resp);
});

httpsServer.listen(config.httpsPort, () => {
  console.log(`Listening on port: ${config.httpsPort}`);
});
