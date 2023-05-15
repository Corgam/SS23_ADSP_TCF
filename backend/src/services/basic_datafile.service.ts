import { Request, Response } from "express";
import db from "../models/db";
import { BasicDatafile } from "../interfaces/basic_datafile.interface";
const BasicDataFile = db.basicDataFileSchema;

export type BasicDatafileCreationParams = Pick<BasicDatafile, "title" | "description">;

export class BasicDatafileService {

// Creates a single basic data file from provided JSON
 public create= (responseBody: BasicDatafileCreationParams) => {
  // Check if the title is not empty
//   if (!req.body || !req.body.title) {
//     res.status(400).send({
//       message: "Title value cannot be empty.",
//     });
//     return;
//   }
//   console.log("[POST] Creating a new file.");
  // Create new basic data file
  const datafile = new BasicDataFile({
    title: responseBody.title,
    description: responseBody.description,
  });
  // Save the basic data file into DB
    return datafile.save(datafile)
    // .then((data: any) => { res.send(data); })
    // .catch((error: Error) => {
    //   console.log("There has been an error creating a basic data file.");
    //   res.status(500).send({
    //     message:
    //       error.message ||
    //       "There has been an error creating a basic data file.",
    //   });
    // });
};

// Deletes the single basic data file with given ID
 public deleteDataFile = (req: Request, res: Response) => {
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
 public updateDataFile = (req: Request, res: Response) => {
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
 public get = (id: string) : Promise<BasicDatafile> => {
//   // Check if ID exists
//   if (!req.params || !req.params.id) {
//     res.status(400).send({
//       message: "ID value cannot be empty.",
//     });
//     return;
//   }
//   console.log(`[GET] Returning file with id ${req.params.id}.`);
  // Get the file by ID
//   const id = req.params.id;
  return BasicDataFile.findById(id);
    // .then((data: JSON) => {
    //   if (!data) {
    //     res
    //       .status(404)
    //       .send({ message: "Didn't find a Basic Data File with id " + id });
    //   } else {
    //     res.send(data);
    //   }
    // })
    // .catch((error: Error) => {
    //   res
    //     .status(500)
    //     .send({ message: "Error retrieving a Basic Data File with id " + id });
    // });
};

// Returns all basic data files
// TO-DO filtering
 public getAll= () : Promise<BasicDatafile[]> => {
//   console.log("[GET] Returning all files.");
  return BasicDataFile.find();
    // .then((data: JSON) => {
    //   res.send(data);
    // })
    // .catch((error: Error) => {
    //   res
    //     .status(500)
    //     .send({ message: "Error retrieving all Basic Data Files." });
    // });
};

}