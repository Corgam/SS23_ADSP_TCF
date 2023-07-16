import { v4 as uuidv4 } from "uuid";

import {
  SupportedDatasetFileTypes,
  NotRefDataFile,
  DataType,
} from "../../../../../common/types";
import datafileModel from "../../models/datafile.model";
import {
  handleNetCDFFileData,
  handleNetCDFFileDataWithOptions,
} from "./datafileRawParsing.service";

type CoordinateMap = Map<any, any>;

/**
 * This function handles a CERV2 file by first creating data points without the actual data,
 * and then adding the data continuously. This approach is used to optimize memory usage.
 * 
 * @param file - The CERV2 file to be processed.
 * @param tags - Optional tags associated with the file.
 */
export async function handleCERV2File(
  file: Express.Multer.File,
  tags?: string
) {
  const tagList = tags?.split(",").map((tag) => tag.trim());
  const uploadId = uuidv4();

  console.log("Getting metadata");
  // Retrieve NetCDF metadata for the file
  const metadata = await handleNetCDFFileData(file, "/metadata");

  console.log("Creating data files");
  // Create data files without CERV2 variables data
  await createAndSaveDatafiles(metadata, file, uploadId, tagList);

  // Get only variables with location data
  const { 
    locationWithTimeVariableNames,
    locationVariableNames 
  } = getVariablesNamesWithLocationData(metadata);

  console.log("Adding data to data files");
  await Promise.all([
    // Save variables with time and location to content.data.time_vars
    await createAndSaveLocationWithTimeVars(
      file,
      metadata,
      locationWithTimeVariableNames,
      uploadId
    ),
    // Save variables with only location to content.data.vars
    await createAndSaveLocationVars(
      file,
      metadata,
      locationVariableNames,
      uploadId
    ),
  ]);
}


async function createAndSaveLocationVars(
  file: Express.Multer.File, 
  metadata: any, 
  locationVariableNames: string[],
  uploadId: string
) {
  // create content.data.vars
  const locationVarMap = new Map();
  const cerv2_var_gen = handleNetCDFFileDataWithOptions(
    file,
    "/data",
    { filter: locationVariableNames, isCERv2: true }
  );

  for await (const cerv2_var of cerv2_var_gen) {
    addValuesToLocationMap(locationVarMap, metadata, cerv2_var);
  }
  
  for (const coordinatesPair of locationVarMap.entries()) {
    const { x, y } = JSON.parse(coordinatesPair[0]);
    await datafileModel.findOneAndUpdate(
      {
        "traceId": uploadId,
        "content.location.coordinates": [x, y],
      },
      {
        $set: {
          "content.data.dataObject.vars": {
            ...coordinatesPair[1],
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
}

async function createAndSaveLocationWithTimeVars(
  file: Express.Multer.File, 
  metadata: any, 
  locationWithTimeVariableNames: string[],
  uploadId: string
) {
  const locationTimeVarMap = new Map();
  const cerv2_var_gen = handleNetCDFFileDataWithOptions(
    file,
    "/data",
    { filter: locationWithTimeVariableNames, isCERv2: true }
  );

  for await (const cerv2_var of cerv2_var_gen) {
    addValuesToTimeLocationMap(locationTimeVarMap, metadata, cerv2_var);
  }
  for (const coordinatesPair of locationTimeVarMap.entries()) {
    const { x, y } = JSON.parse(coordinatesPair[0]);

    await datafileModel.findOneAndUpdate(
      {
        "traceId": uploadId,
        "content.location.coordinates": [x, y],
      },
      {
        $set: {
          "content.data.dataObject.time_vars": {
            ...coordinatesPair[1],
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
}


async function createAndSaveDatafiles(metadata: any, file: Express.Multer.File, uploadId: string, tags?: string[]) {
  for (const datafile of tansformMetadataToDatafile(metadata, file, uploadId, tags)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [ x, y ] = datafile.content.location!.coordinates!;

    await datafileModel.create(datafile);
  }
}

function* tansformMetadataToDatafile(
  metadata: any,
  file: Express.Multer.File,
  uploadId: string,
  tags?: string[]
): Generator<NotRefDataFile> {
  let dataId = 0;

  const xCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LAT"];
  const yCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LON"];

  for (let x = 0; x < metadata["dimensions"]["west_east"]; x++) {
    for (let y = 0; y < metadata["dimensions"]["south_north"]; y++) {
      const description = `A datapoint no.${dataId} from CERV2 dataset file: ${file.originalname}`;

      const datafile: NotRefDataFile = {
        title: `${file.originalname}_${dataId}`,
        description: description,
        dataType: DataType.NOTREFERENCED,
        dataSet: SupportedDatasetFileTypes.CERV2,
        tags,
        traceId: uploadId,
        content: {
          data: {
            netCDFInfo: metadata,
          },
          location: {
            type: "Point",
            coordinates: [xCoordinateOffset + x, yCoordinateOffset + y],
          },
        },
      };
      dataId++;

      yield datafile;
    }
  }
}

export function getVariablesNamesWithLocationData(metadata: any) {
  // get variable names
  const locationWithTimeVariableNames = [];
  const locationVariableNames = [];

  for (const [variable_name, variable_value] of Object.entries<any>(
    metadata["variables_metadata"]
  )) {
    const hasTimeDimension = variable_value["dimensions"].includes("time");
    const hasXDimension = variable_value["dimensions"].includes("west_east");
    const hasYDimension = variable_value["dimensions"].includes("south_north");

    if (hasTimeDimension && hasXDimension && hasYDimension) {
      locationWithTimeVariableNames.push(variable_name);
    }
    if (!hasTimeDimension && hasXDimension && hasYDimension) {
      locationVariableNames.push(variable_name);
    }
  }

  return { locationWithTimeVariableNames, locationVariableNames };
}

export function addValuesToTimeLocationMap(
  locationTimeVarMap: Map<string, any>,
  metadata: any,
  data: any
): CoordinateMap {
  const xCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LAT"];
  const yCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LON"];

  const variable = Object.keys(data["variables_data"])[0];

  for (let x = 0; x < metadata["dimensions"]["west_east"]; x++) {
    for (let y = 0; y < metadata["dimensions"]["south_north"]; y++) {
      for (let t = 0; t < metadata["dimensions"]["time"]; t++) {
        // append if already exists
        const key = JSON.stringify({
          x: xCoordinateOffset + x,
          y: yCoordinateOffset + y,
        });
        let current = locationTimeVarMap.get(key) ?? {};
        const value = data["variables_data"][variable]["data"][x][y][t];

        if(Array.isArray(value)) {
          const dimensions = data["variables_data"][variable]["dimensions"].slice(3);
          current = {
            ...current,
            [variable]: value,
            dimensions
          };
        } else {
          current = {
            ...current,
            [variable]: value,
          };
        }

        locationTimeVarMap.set(key, current);
      }
    }
  }

  return locationTimeVarMap;
}

export function addValuesToLocationMap(
  locationVarMap: Map<string, any>,
  metadata: any,
  data: any
): CoordinateMap {
  const xCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LAT"];
  const yCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LON"];

  const variable = Object.keys(data["variables_data"])[0];

  // get variable data for each location variable
  for (let x = 0; x < metadata["dimensions"]["west_east"]; x++) {
    for (let y = 0; y < metadata["dimensions"]["south_north"]; y++) {
      // append if already exists
      const key = JSON.stringify({
        x: xCoordinateOffset + x,
        y: yCoordinateOffset + y,
      });
      let current = locationVarMap.get(key) ?? {};
      const value = data["variables_data"][variable]["data"][x][y];

      if(Array.isArray(value)) {
        const dimensions = data["variables_data"][variable]["dimensions"].slice(2);
        current = {
          ...current,
          [variable]: value,
          dimensions
        };
      } else {
        current = {
          ...current,
          [variable]: value,
        };
      }

      locationVarMap.set(key, current);
    }
  }

  return locationVarMap;
}
