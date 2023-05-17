import express, { Application, Request, Response } from "express";
import cors from "cors";
import { ConnectOptions } from "mongoose";
import appendRoutes from "./routes/datafiles.routes";
import db from "./models/db";
import config from "./config/config";

// Create app
const app: Application = express();

// Cors (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: `http://${config.HOST}:${config.PORT}`,
};

app.use(cors(corsOptions));

// Handle the simplest request
app.get("/", (req: Request, res: Response) => {
  res.send(
    "Welcome to the TCF Project's Express backend. Read the repository to see the API's guidelines."
  );
});

// Connect to the MongoDB
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
appendRoutes(app);

// Listen for requests
app.listen(config.PORT, config.HOST, () => {
  console.log(`Running on http://${config.HOST}:${config.PORT}`);
});
