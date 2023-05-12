import express, { Application } from "express";

// Appends multiple routes to the application
module.exports = (app: Application) => {
  // Get the router and controller
  const datafilesController = require("../controllers/datafiles.controller");
  var router = express.Router();
  // Handle creation of new datafile
  router.post("/", datafilesController.createDataFile);

  // TO-DO other routes

  // Append the routes at "/datafiles"
  app.use("/datafiles", router);
};
