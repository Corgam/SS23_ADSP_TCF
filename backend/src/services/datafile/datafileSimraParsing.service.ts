import { JsonObject } from "swagger-ui-express";
import streamifier from "streamifier";
import csv from "csv-parse";
import { Readable } from "stream";

/**
 * Handle files from the SimRa dataset
 *
 * @param file - The SimRa file to create a datafile object from.
 * @returns Final Datafile object
 * @throws Error when line reader fails
 */
export async function handleSimRaFile(
  file: Express.Multer.File
): Promise<JsonObject[]> {
  let documents: JsonObject[] = [];
  // Get header line
  let fs = streamifier.createReadStream(file.buffer);
  const headerLineIndex = await getHeaderLineIndex(fs);
  // Create header document
  fs = streamifier.createReadStream(file.buffer);
  documents = documents.concat(
    await createHeadersDocuments(file, fs, headerLineIndex)
  );
  // Create datapoint documents
  fs = streamifier.createReadStream(file.buffer);
  documents = documents.concat(
    await createDatapointDocuments(file, fs, headerLineIndex)
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
 * @returns array of MongoDB documents
 */
async function createDatapointDocuments(
  file: Express.Multer.File,
  fs: Readable,
  headerLineIndex: number
): Promise<JsonObject[]> {
  return new Promise<JsonObject[]>((resolve) => {
    let dataID = 0;
    const documents: JsonObject[] = [];
    // Search the headerline
    fs.pipe(csv.parse({ from_line: headerLineIndex + 3, columns: true }))
      // Append the data to the array
      .on("data", (dataObject: JsonObject) => {
        const document = {
          title: `${file.originalname}_${dataID}`,
          description: `A datapoint no.${dataID} from SimRa dataset file: ${file.originalname}`,
          dataType: "NOTREFERENCED",
          tags: ["simra", "datapoint", `${file.originalname}`],
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
  });
}

/**
 *  Returns an array of all headers documents.
 *
 * @param file the simra file
 * @param fs file stream
 * @param headerLine the index of the header line
 * @returns array of MongoDB documents
 */
async function createHeadersDocuments(
  file: Express.Multer.File,
  fs: Readable,
  headerLineIndex: number
): Promise<JsonObject[]> {
  return new Promise<JsonObject[]>((resolve) => {
    let dataID = 0;
    const documents: JsonObject[] = [];
    // Search the headerline
    fs.pipe(
      csv.parse({ from_line: 2, to_line: headerLineIndex - 1, columns: true })
    )
      // Append the data to the array
      .on("data", (dataObject: JsonObject) => {
        const document = {
          title: `${file.originalname}_header_${dataID}`,
          description: `A header object no.${dataID} from SimRa dataset file: ${file.originalname}`,
          dataType: "NOTREFERENCED",
          tags: ["simra", "header", `${file.originalname}`],
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
        reject(new Error("No header line inside the SimRa file."));
      }
    });
  });
}
