import { Request, Response } from "express";
var db = require("../models/db");
const BasicDataFile = db.basicDataFileSchema;

exports.createDataFile = (req: Request, res: Response) => {
  // Check if the title is not empty
  if (!req.body || !req.body.title) {
    res.status(400).send({
      message: "Title value cannot be empty.",
    });
    return;
  }
  console.log("[POST] Creating a new file.");
  // Create new basic data file
  const datafile = new BasicDataFile({
    title: req.body.title,
    description: req.body.description,
  });
  // Save the basic data file into DB
  datafile
    .save(datafile)
    .then((data: any) => {
      res.send(data);
    })
    .catch((error: Error) => {
      console.log("There has been an error creating a basic data file.");
      res.status(500).send({
        message:
          error.message ||
          "There has been an error creating a basic data file.",
      });
    });
};

// Deletes the single basic data file with given ID
exports.deleteDataFile = (req: Request, res: Response) => {
  // Check if ID exists
  if (!req.params || !req.params.id) {
    res.status(400).send({
      message: "ID value cannot be empty.",
    });
    return;
  }
  console.log(`[DELETE] Deleting file with id ${req.params.id}.`);
  // Get the file by ID
  const id = req.params.id;
  // Remove the file from DB
  BasicDataFile.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data: JSON) => {
      res.send({ message: "Basic Data File deleted successfully." });
    })
    .catch((error: Error) => {
      res
        .status(500)
        .send({ message: "Error when deleting Basic Data file with id" + id });
    });
};

// Updates a single basic data file by ID
exports.updateDataFile = (req: Request, res: Response) => {
  // Check if ID exists
  if (!req.params || !req.params.id) {
    res.status(400).send({
      message: "ID value cannot be empty.",
    });
    return;
  }
  console.log(`[PUT] Updating file with id ${req.params.id}.`);
  // Check if the body is not empty
  if (!req.body) {
    res.status(400).send({
      message: "Body cannot be empty.",
    });
    return;
  }
  // Update the file inside DB
  const id = req.params.id;
  BasicDataFile.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false,
  })
    .then((data: JSON) => {
      if (!data) {
        res
          .status(404)
          .send({ message: "Cannot update a basic data file with id " + id });
      } else {
        res.send({ message: "Basic Data File was updated successfully." });
      }
    })
    .catch((error: Error) => {
      res.status(500).send({
        message: "Error while updating a Basic Data File with id " + id,
      });
    });
};

// Returns a single basic data file by ID
exports.getSingleDataFile = (req: Request, res: Response) => {
  // Check if ID exists
  if (!req.params || !req.params.id) {
    res.status(400).send({
      message: "ID value cannot be empty.",
    });
    return;
  }
  console.log(`[GET] Returning file with id ${req.params.id}.`);
  // Get the file by ID
  const id = req.params.id;
  BasicDataFile.findById(id)
    .then((data: JSON) => {
      if (!data) {
        res
          .status(404)
          .send({ message: "Didn't find a Basic Data File with id " + id });
      } else {
        res.send(data);
      }
    })
    .catch((error: Error) => {
      res
        .status(500)
        .send({ message: "Error retrieving a Basic Data File with id " + id });
    });
};

// Returns all basic data files
// TO-DO filtering
exports.getAllDataFiles = (req: Request, res: Response) => {
  console.log("[GET] Returning all files.");
  BasicDataFile.find()
    .then((data: JSON) => {
      res.send(data);
    })
    .catch((error: Error) => {
      res
        .status(500)
        .send({ message: "Error retrieving all Basic Data Files." });
    });
};
