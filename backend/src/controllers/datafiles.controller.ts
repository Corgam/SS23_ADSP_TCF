import { Request, Response } from "express";
var db = require("../models/db");
const BasicDataFile = db.basicDataFileSchema;

exports.createDataFile = (req: Request, res: Response) => {
  console.log("[REQ]: Create new datafile.");
  // Check if the title is not empty
  if (!req.body || !req.body.title) {
    if (req.body) {
      console.log(req.body.title);
    }
    res.status(400).send({
      message: "Title value cannot be empty.",
    });
    return;
  }
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
