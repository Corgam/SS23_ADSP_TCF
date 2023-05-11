import express , { Application } from "express";

// Constants
const PORT = process.env.PORT ? +process.env.PORT : 8080;
const HOST = "0.0.0.0";

// App
const app: Application = express();
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});