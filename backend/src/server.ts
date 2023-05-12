import express, { Application, Request, Response } from "express";
import cors from "cors";
import { ConnectOptions } from "mongoose";

// Constants
const PORT = process.env.PORT ? +process.env.PORT : 8080;
const HOST = "0.0.0.0";

// Create app
const app: Application = express();

// Cors (Cross-Origin Resource Sharing)
var corsOptions = {
  origin: `http://localhost:${PORT}`,
};

app.use(cors(corsOptions));

// Handle the simplest request
app.get("/", (req: Request, res: Response) => {
  res.send(
    "Welcome to the TCF Project's Express backend. Read the repository to see the API's guidelines."
  );
});

// Connect to the MongoDB
const db = require("./models/db");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => {
    console.log("Connected to the database at: %s", db.url);
  })
  .catch((error: Error) => {
    console.log("Cannot connect to the database at %s!", db.url, error);
    // Terminate the container
    process.exit();
  });

// Append other routes
require("./routes/datafiles.routes")(app);

// Listen for requests
app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
