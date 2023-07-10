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
 * Handle files from the SimRa dataset
 *
 * @param file - The SimRa file to create a datafile object from.
 * @param model - The MongoDB Schema (model) for which to create the documents
 * @param tags - Optional tags to be appended to all created documents, seperated by commas.
 * @param description - Optional description to be added to all created documents.
 * @returns Final Datafile object
 * @throws Error when line reader fails
 */
export async function handleSimRaFile(
  file: Express.Multer.File,
  model: Readonly<Model<Datafile>>,
  tags?: string,
  description?: string
): Promise<Datafile[]> {
  let documents: JsonObject[] = [];
  // Get header line
  let fs = streamifier.createReadStream(file.buffer);
  const headerLineIndex = await getHeaderLineIndex(fs);
  const tagsArray = tags?.split(",");
  fs = resetReadableStream(fs, file.buffer);
  const headersVersion = await getNthLine(fs, 0);
  fs = resetReadableStream(fs, file.buffer);
  const dataVersion = await getNthLine(fs, headerLineIndex + 1);
  // Create header document
  fs = resetReadableStream(fs, file.buffer);
  documents = documents.concat(
    await createHeadersDocuments(
      file,
      fs,
      headerLineIndex,
      headersVersion,
      tagsArray,
      description
    )
  );
  // Create datapoint documents
  fs = streamifier.createReadStream(file.buffer);
  documents = documents.concat(
    await createDatapointDocuments(
      file,
      fs,
      headerLineIndex,
      dataVersion,
      tagsArray,
      description
    )
  );
  // Return the array of parsed JSON objects
  return await model.create(documents);
}

/**
 *  Returns an array of all datapoints documents.
 *
 * @param file the simra file
 * @param fs file stream
 * @param headerLine the index of the header line
 * @param versionInfo a string representing the version information for all datapoints documents
 * @param tags - Optional tags to be appended to all created documents, seperated by commas.
 * @param description - Optional description to be added to all created documents.
 * @returns array of MongoDB documents
 */
async function createDatapointDocuments(
  file: Express.Multer.File,
  fs: Readable,
  headerLineIndex: number,
  versionInfo: string,
  tags?: string[],
  description?: string
): Promise<JsonObject[]> {
  return new Promise<JsonObject[]>((resolve, reject) => {
    try {
      let dataID = 0;
      const documents: JsonObject[] = [];
      // Prepare all necessary data
      let finalTags = ["simra", "datapoint", `${file.originalname}`];
      if (tags) {
        finalTags = finalTags.concat(tags);
      }
      const finalDescription = description
        ? description
        : `A datapoint no.${dataID} from SimRa dataset file: ${file.originalname}`;
      // Search the headerline
      fs.pipe(csv.parse({ from_line: headerLineIndex + 3, columns: true }))
        // Append the data to the array
        .on("data", (dataObject: JsonObject) => {
          const document = {
            title: `${file.originalname}_${dataID}`,
            description: finalDescription,
            dataType: "NOTREFERENCED",
            tags: finalTags,
            dataSet: SupportedDatasetFileTypes.SIMRA,
            content: {
              data: {
                versionInfo: versionInfo,
                dataObject: dataObject,
                headersRefs: "",
              },
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

/**
 *  Returns an array of all headers documents.
 *
 * @param file the simra file
 * @param fs file stream
 * @param headerLine the index of the header line
 * @param versionInfo a string representing the version information for all headers documents
 * @param tags - Optional tags to be appended to all created documents, seperated by commas.
 * @param description - Optional description to be added to all created documents.
 * @returns array of MongoDB documents
 */
async function createHeadersDocuments(
  file: Express.Multer.File,
  fs: Readable,
  headerLineIndex: number,
  versionInfo: string,
  tags?: string[],
  description?: string
): Promise<JsonObject[]> {
  return new Promise<JsonObject[]>((resolve, reject) => {
    try {
      let dataID = 0;
      const documents: JsonObject[] = [];
      // Prepare all necessary data
      let finalTags = ["simra", "header", `${file.originalname}`];
      if (tags) {
        finalTags = finalTags.concat(tags);
      }
      const finalDescription = description
        ? description
        : `A header object no.${dataID} from SimRa dataset file: ${file.originalname}`;
      // Search the headerline
      fs.pipe(
        csv.parse({ from_line: 2, to_line: headerLineIndex - 1, columns: true })
      )
        // Append the data to the array
        .on("data", (dataObject: JsonObject) => {
          const document = {
            title: `${file.originalname}_header_${dataID}`,
            description: finalDescription,
            dataType: "NOTREFERENCED",
            tags: finalTags,
            dataSet: SupportedDatasetFileTypes.SIMRA,
            content: {
              data: { versionInfo: versionInfo, dataObject: dataObject },
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
        new FailedToParseError("Failed to create SimRa header documents!")
      );
    }
  });
}

/**
 *  Returns the line index of the header line from Simra file.
 *  Written with the help of ChatGPT.
 *
 * @param fs file stream
 * @returns the line index of the header line
 */
async function getHeaderLineIndex(fs: Readable): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    try {
      let lineIndex = 0;
      let finalLineIndex = -1;
      // Search the headerline
      fs.on("data", (chunk) => {
        const lines = String(chunk).split("\n");
        for (const line of lines) {
          if (line.includes("=========================")) {
            finalLineIndex = lineIndex;
            resolve(finalLineIndex);
            return; // Stop processing further lines
          } else {
            lineIndex = lineIndex + 1;
          }
        }
      }).on("end", () => {
        if (finalLineIndex === -1) {
          reject(
            new FailedToParseError("No header line inside the SimRa file.")
          );
        }
      });
    } catch {
      reject(new FailedToParseError("Failed to parse SimRa file!"));
    }
  });
}

/**
 * Returns the Nth line from Simra file as a string.
 * Written with the help of ChatGPT.
 *
 * @param fs file stream
 * @param lineIndex the index of the line to retrieve (starting from 0)
 * @returns the Nth line as a string
 */
async function getNthLine(fs: Readable, lineIndex: number): Promise<string> {
  console.log("started search");
  return new Promise<string>((resolve, reject) => {
    try {
      let currentIndex = 0;
      let nthLine: string | null = null;
      // Search for the Nth line
      fs.on("data", (chunk) => {
        const lines = String(chunk).split("\n");
        for (const line of lines) {
          console.log(line);
          if (currentIndex === lineIndex) {
            nthLine = line;
            resolve(nthLine);
            return; // Stop processing further lines
          } else {
            currentIndex++;
          }
        }
      }).on("end", () => {
        if (nthLine === null) {
          reject(
            new FailedToParseError(
              `Line ${lineIndex} not found inside the SimRa file.`
            )
          );
        }
      });
    } catch {
      reject(new FailedToParseError("Failed to parse SimRa file!"));
    }
  });
}

/**
 * Resets a readable stream
 * @param oldFs old stream to close
 * @param buffer buffer for which to create the new stream
 * @returns new readable stream
 */
function resetReadableStream(oldFs: Readable, buffer: Buffer) {
  oldFs.pause();
  oldFs.removeAllListeners();
  oldFs.destroy();
  return streamifier.createReadStream(buffer);
}
