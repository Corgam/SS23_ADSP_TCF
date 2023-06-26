import { JsonObject } from "swagger-ui-express";
import streamifier from "streamifier";
import csv from "csv-parse";
import { Readable } from "stream";
import { FailedToParseError } from "../../errors";
import { SupportedDatasetFileTypes } from "../../../../../common/types";

/**
 * Handle files from the SimRa dataset
 *
 * @param file - The SimRa file to create a datafile object from.
 * @param tag - Optional tag to be appended to all created documents
 * @param description - Optional description to be added to all created documents.
 * @returns Final Datafile object
 * @throws Error when line reader fails
 */
export async function handleSimRaFile(
  file: Express.Multer.File,
  tag?: string,
  description?: string
): Promise<JsonObject[]> {
  let documents: JsonObject[] = [];
  // Get header line
  let fs = streamifier.createReadStream(file.buffer);
  const headerLineIndex = await getHeaderLineIndex(fs);
  // Create header document
  fs = streamifier.createReadStream(file.buffer);
  documents = documents.concat(
    await createHeadersDocuments(file, fs, headerLineIndex, tag, description)
  );
  // Create datapoint documents
  fs = streamifier.createReadStream(file.buffer);
  documents = documents.concat(
    await createDatapointDocuments(file, fs, headerLineIndex, tag, description)
  );
  // Return the array of parsed JSON objects
  return documents;
}

/**
 *  Returns an array of all datapoints documents.
 *
 * @param file the simra file
 * @param fs file stream
 * @param headerLine the index of the header line
 * @param tag - Optional tags to be appended to all created documents
 * @param description - Optional description to be added to all created documents.
 * @returns array of MongoDB documents
 */
async function createDatapointDocuments(
  file: Express.Multer.File,
  fs: Readable,
  headerLineIndex: number,
  tag?: string,
  description?: string
): Promise<JsonObject[]> {
  return new Promise<JsonObject[]>((resolve, reject) => {
    try {
      let dataID = 0;
      const documents: JsonObject[] = [];
      // Prepare the tags and description
      const finalTags = ["simra", "datapoint", `${file.originalname}`];
      if (tag) {
        finalTags.push(tag);
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
              data: { dataObject, headerRef: "" },
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
 * @param tag - Optional tag to be appended to all created documents
 * @param description - Optional description to be added to all created documents.
 * @returns array of MongoDB documents
 */
async function createHeadersDocuments(
  file: Express.Multer.File,
  fs: Readable,
  headerLineIndex: number,
  tag?: string,
  description?: string
): Promise<JsonObject[]> {
  return new Promise<JsonObject[]>((resolve, reject) => {
    try {
      let dataID = 0;
      const documents: JsonObject[] = [];
      // Prepare the tags and description
      const finalTags = ["simra", "header", `${file.originalname}`];
      if (tag) {
        finalTags.push(tag);
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
