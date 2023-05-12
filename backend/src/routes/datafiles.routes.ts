import express, { Application } from "express";
import bodyParser, { json } from "body-parser";

// Appends multiple routes to the application
module.exports = (app: Application) => {
  // Create JSON parser
  var jsonParser = bodyParser.json();
  var urlParser = bodyParser.urlencoded({ extended: false });

  // Get the router and controller
  const datafilesController = require("../controllers/datafiles.controller");
  var router = express.Router();
  // Handle creation of new basic data file
  router.post("/", jsonParser, datafilesController.createDataFile);
  // Delete a basic data file
  router.delete("/:id", urlParser, datafilesController.deleteDataFile);
  // Update a basic data file
  router.put("/:id", urlParser, jsonParser, datafilesController.updateDataFile);
  // Get a single basic data file
  router.get("/:id", urlParser, datafilesController.getSingleDataFile);
  // Get all basic data files
  router.get("/", jsonParser, datafilesController.getAllDataFiles);
  // Append the routes at "/datafiles"
  app.use("/datafiles", router);
};
