// server.js
const mongoose = require("mongoose");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const isDev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev: isDev, hostname, port });
const handle = app.getRequestHandler();
const mongooseConnectionOptions = {
  bufferCommands: false,
};

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  }).listen(port, async (err) => {
    if (err) throw err;
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGODB_URI, mongooseConnectionOptions);
    console.info(`> Ready on http://${hostname}:${port}`);
  });
});
