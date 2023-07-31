import { v4 as uuidv4 } from "uuid";
import { JsonObject } from "swagger-ui-express";
import streamifier from "streamifier";
import csv from "csv-parse";
import { Readable } from "stream";
import { FailedToParseError } from "../../errors";
import {
  Datafile,
  SupportedDatasetFileTypes,
} from "../../../../../common/types";
import { Model } from "mongoose";

/**
 * Handle files from the CSV dataset
 *
 * @param file - The CSV file to create a datafile objects from.
 * @param model - The MongoDB Schema (model) for which to create the documents
 * @param tags - [Optional] The tags to be appended to all created documents, seperated by commas.
 * @param description - [Optional] The description to be added to all created documents.
 * @returns Final Datafile object
 * @throws Error when line reader fails
 */
export async function handleCSVDatasetFile(
  file: Express.Multer.File,
  model: Readonly<Model<Datafile>>,
  tags?: string,
  description?: string
): Promise<Datafile[]> {
  let documents: Datafile[] = [];
  const fs = streamifier.createReadStream(file.buffer);
  // Prepare tags
  let tagsArray = tags?.split(",");
  if (tagsArray !== undefined) {
    tagsArray = tagsArray.map((tag) => {
      return tag.trim();
    });
  }
  // Create uploadID
  const uploadID = uuidv4();
  // Create datapoint documents
  const dataObjects = await createCSVDatapointObjects(
    file,
    fs,
    uploadID,
    tagsArray,
    description
  );
  const dataDocuments = await model.create(dataObjects);
  documents = documents.concat(dataDocuments);
  // Return the array of parsed JSON objects
  return documents;
}

/**
 *  Returns an array of all datapoints documents.
 *
 * @param file the simra file
 * @param fs file stream
 * @param headerLine the index of the header line
 * @param versionInfo a string representing the version information for all datapoints documents
 * @param uploadId the upload ID for this SimRa file
 * @param tags - [Optional] The tags to be appended to all created documents, seperated by commas.
 * @param description - [Optional] The description to be added to all created documents.
 * @returns array of MongoDB documents
 */
async function createCSVDatapointObjects(
  file: Express.Multer.File,
  fs: Readable,
  uploadID: string,
  tags?: string[],
  description?: string
): Promise<JsonObject[]> {
  return new Promise<JsonObject[]>((resolve, reject) => {
    try {
      let dataID = 0;
      const documents: JsonObject[] = [];
      // Prepare all necessary data
      let finalTags = ["CSV", "datapoint", `${file.originalname}`];
      if (tags) {
        finalTags = finalTags.concat(tags);
      }
      const finalDescription = description
        ? description
        : `A datapoint no.${dataID} from CSV dataset file: ${file.originalname}`;
      // Search the headerline
      fs.pipe(csv.parse({ columns: true }))
        // Append the data to the array
        .on("data", (dataObject: JsonObject) => {
          const document = {
            title: `${file.originalname}_${dataID}`,
            description: finalDescription,
            dataType: "NOTREFERENCED",
            uploadID: uploadID,
            tags: finalTags,
            dataSet: SupportedDatasetFileTypes.SIMRA,
            content: {
              data: dataObject,
              location: {
                type: "Point",
                coordinates: [dataObject.lon, dataObject.lat],
              },
            },
          };
          documents.push(document);
          dataID++;
        })
        .on("end", () => {
          resolve(documents);
        });
    } catch (error) {
      reject(
        new FailedToParseError("Failed to create SimRa datapoint documents!")
      );
    }
  });
}
