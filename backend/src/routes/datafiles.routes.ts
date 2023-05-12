import express, { Application } from "express";
import bodyParser from "body-parser";

// Appends multiple routes to the application
module.exports = (app: Application) => {
  // Create JSON parser
  var jsonParser = bodyParser.json();

  // Get the router and controller
  const datafilesController = require("../controllers/datafiles.controller");
  var router = express.Router();
  // Handle creation of new datafile
  router.post("/", jsonParser, datafilesController.createDataFile);

  // TO-DO other routes

  // Append the routes at "/datafiles"
  app.use("/datafiles", router);
};
