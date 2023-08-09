/**
 * Module containing functions and utilities for handling CERV2 dataset files.
 */
import { v4 as uuidv4 } from "uuid";
import {
  SupportedDatasetFileTypes,
  NotRefDataFile,
  DataType,
} from "../../../../../common/types";
import datafileModel from "../../models/datafile.model";
import NetcdfApi from "../../services/netcdfApi.service";

/**
 * Handles a CERV2 dataset file by extracting metadata, creating datafiles, and storing them.
 *
 * @param file - The CSV file to create a datafile objects from.
 * @param stepSize - The sampling interval (sample every Nth data point)
 * @param tags - [Optional] The tags to be appended to all created documents, seperated by commas.
 * @param description - [Optional] The description to be added to all created documents.
 */
export async function handleCERV2File(
  file: Express.Multer.File,
  tags = "",
  stepSize = 10,
  description?: string
) {
  const uploadId = uuidv4();

  // Retrieve metadata from the NetCDF file
  const metadata = await NetcdfApi.getMetaData(file);

  // Get variable names with location data
  const locationVariableNames = getVariablesNamesWithLocationData(metadata);

  // Split and trim tags
  const tagList = tags.split(",").map((tag) => tag.trim());

  console.log("Adding data to data files");
  for await (const datafile of createDatafiles(
    file,
    metadata,
    locationVariableNames,
    stepSize,
    tagList,
    uploadId,
    description
  )) {
    // Create and store datafiles in the database
    await datafileModel.create(datafile);
  }
}

/**
 * Generates datafiles based on the CERV2 dataset file.
 *
 * @param file - The CERV2 dataset file to generate datafiles from.
 * @param metadata - Metadata extracted from the NetCDF file.
 * @param locationVariableNames - List of variable names containing location data.
 * @param stepSize - The sampling interval (sample every Nth data point)
 * @param tags - List of tags to associate with the datafiles.
 * @param uploadID - Unique upload identifier.
 * @param description - Optional description for the datafiles.
 * @yields {NotRefDataFile} - A datafile generated from the CERV2 dataset.
 */
async function* createDatafiles(
  file: Express.Multer.File,
  metadata: any,
  locationVariableNames: string[],
  stepSize: number,
  tags: string[],
  uploadID: string,
  description?: string
) {
  const cerv2_var_gen = await NetcdfApi.getCERv2DataChunks(file, {
    filter: locationVariableNames,
    stepSize,
  });

  let dataId = 0;
  for await (const data of cerv2_var_gen) {
    description ??= `A datapoint no.${dataId} from CERV2 dataset file: ${file.originalname}`;
    const { lon, lat, ...remainingVars } = data["vars"];
    if (lon === undefined) {
      throw new Error("no longitude in dataset defined");
    }
    if (lat === undefined) {
      throw new Error("no latitude in dataset defined");
    }

    const datafile: NotRefDataFile = {
      title: `${file.originalname}_${dataId}`,
      description: description,
      dataType: DataType.NOTREFERENCED,
      dataSet: SupportedDatasetFileTypes.CERV2,
      tags: ["CERv2", ...tags, ...locationVariableNames],
      uploadID,
      content: {
        data: {
          netCDFInfo: metadata,
          vars: remainingVars,
          timeVars: data["timeVars"],
        },
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
      },
    };
    dataId++;
    yield datafile;
  }
}

/**
 * Retrieves variable names with location data from the metadata.
 *
 * @param metadata - Metadata extracted from the NetCDF file.
 * @returns {string[]} - List of variable names containing location data.
 */
export function getVariablesNamesWithLocationData(metadata: any): string[] {
  // get variable names
  const locationVariableNames = [];

  for (const [variable_name, variable_value] of Object.entries<any>(
    metadata["variables_metadata"]
  )) {
    if (
      variable_value["dimensions"].includes("south_north") &&
      variable_value["dimensions"].includes("west_east")
    ) {
      locationVariableNames.push(variable_name);
    }
  }

  return locationVariableNames;
}
