import express, { Application } from "express";
import bodyParser from "body-parser";
import {
  createDataFile,
  deleteDataFile,
  updateDataFile,
  getSingleDataFile,
  getAllDataFiles,
} from "../controllers/datafiles.controller";

// Appends multiple routes to the application
const appendRoutes = (app: Application) => {
  // Create JSON parser
  var jsonParser = bodyParser.json();
  var urlParser = bodyParser.urlencoded({ extended: false });

  // Get the router and controller
  var router = express.Router();
  // Handle creation of new basic data file
  router.post("/", jsonParser, createDataFile);
  // Delete a basic data file
  router.delete("/:id", urlParser, deleteDataFile);
  // Update a basic data file
  router.put("/:id", urlParser, jsonParser, updateDataFile);
  // Get a single basic data file
  router.get("/:id", urlParser, getSingleDataFile);
  // Get all basic data files
  router.get("/", jsonParser, getAllDataFiles);
  // Append the routes at "/datafiles"
  app.use("/datafiles", router);
};

export default appendRoutes;
