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

export async function handleCERV2File(
  file: Express.Multer.File,
  tags = "",
  stepSize = 10
) {
  const uploadId = uuidv4();

  const metadata = await handleNetCDFFileData(file, "/metadata");

  const { locationWithTimeVariableNames, locationVariableNames } =
    getVariablesNamesWithLocationData(metadata);

  const tagList = [
    "CERv2",
    ...locationWithTimeVariableNames,
    ...(tags.split(",").map((tag) => tag.trim())),
  ];

  console.log("Adding data to data files");

  const timeVarsMap = await createAndSaveLocationWithTimeVars(
    file,
    metadata,
    locationWithTimeVariableNames,
    uploadId,
    stepSize
  );

  console.log("Finished timeVarsMap...");

  const varsMap = await createAndSaveLocationVars(
    file,
    metadata,
    locationVariableNames,
    stepSize
  );

  console.log("Finished varsMap...");

  for (const datafile of tansformMetadataToDatafile(
    metadata,
    file,
    uploadId,
    tagList,
    timeVarsMap,
    varsMap,
    stepSize
  )) {
    await datafileModel.create(datafile);
  }

  console.log("Finished creating datafiles.");
}

async function createAndSaveLocationVars(
  file: Express.Multer.File,
  metadata: any,
  locationVariableNames: string[],
  stepSize: number
) {
  // create content.data.vars
  const locationVarMap = new Map();
  const cerv2_var_gen = handleNetCDFFileDataWithOptions(file, "/data", {
    filter: locationVariableNames,
    isCERv2: true,
    stepSize,
  });

  for await (const cerv2_var of cerv2_var_gen) {
    addValuesToLocationMap(locationVarMap, metadata, cerv2_var, stepSize);
  }

  return locationVarMap;
}

async function createAndSaveLocationWithTimeVars(
  file: Express.Multer.File,
  metadata: any,
  locationWithTimeVariableNames: string[],
  uploadId: string,
  stepSize: number
) {
  const locationTimeVarMap = new Map();
  const cerv2_var_gen = handleNetCDFFileDataWithOptions(file, "/data", {
    filter: locationWithTimeVariableNames,
    isCERv2: true,
    stepSize,
  });

  for await (const cerv2_var of cerv2_var_gen) {
    addValuesToTimeLocationMap(
      locationTimeVarMap,
      metadata,
      cerv2_var,
      stepSize
    );
  }

  return locationTimeVarMap;
}

function* tansformMetadataToDatafile(
  metadata: any,
  file: Express.Multer.File,
  uploadId: string,
  tags: string[],
  timeVarsMap: Map<any, any>,
  varsMap: Map<any, any>,
  stepSize: number
): Generator<NotRefDataFile> {
  let dataId = 0;

  const xCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LON"];
  const yCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LAT"];

  const x_count = Math.ceil(metadata["dimensions"]["west_east"] / stepSize);
  const y_count = Math.ceil(metadata["dimensions"]["south_north"] / stepSize);

  for (let x = 0; x < x_count; x++) {
    for (let y = 0; y < y_count; y++) {
      const key = JSON.stringify({
        x: xCoordinateOffset + x + stepSize,
        y: yCoordinateOffset + y + stepSize,
      });

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
            vars: varsMap.get(key),
            timeVars: timeVarsMap.get(key),
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
  data: any,
  stepSize: number
): CoordinateMap {
  const xCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LON"];
  const yCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LAT"];
  const x_count = Math.ceil(metadata["dimensions"]["west_east"] / stepSize);
  const y_count = Math.ceil(metadata["dimensions"]["south_north"] / stepSize);
  const time_count = metadata["dimensions"]["time"];

  const variable = Object.keys(data["variables_data"])[0];

  for (let x = 0; x < x_count; x++) {
    for (let y = 0; y < y_count; y++) {
      for (let t = 0; t < time_count; t++) {
        // append if already exists
        const key = JSON.stringify({
          x: xCoordinateOffset + x + stepSize,
          y: yCoordinateOffset + y + stepSize,
        });
        let current = locationTimeVarMap.get(key) ?? {};
        const value = data["variables_data"][variable]["data"][x][y][t];

        if (Array.isArray(value)) {
          const dimensions =
            data["variables_data"][variable]["dimensions"].slice(3);
          current = {
            ...current,
            [variable]: value,
            dimensions,
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
  data: any,
  stepSize: number
): CoordinateMap {
  const xCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LON"];
  const yCoordinateOffset = +metadata["global_attributes"]["PROJ_CENTRAL_LAT"];
  const x_count = Math.ceil(metadata["dimensions"]["west_east"] / stepSize);
  const y_count = Math.ceil(metadata["dimensions"]["south_north"] / stepSize);

  const variable = Object.keys(data["variables_data"])[0];

  // get variable data for each location variable
  for (let x = 0; x < x_count; x++) {
    for (let y = 0; y < y_count; y++) {
      // append if already exists
      const key = JSON.stringify({
        x: xCoordinateOffset + x + stepSize,
        y: yCoordinateOffset + y + stepSize,
      });
      let current = locationVarMap.get(key) ?? {};
      const value = data["variables_data"][variable]["data"][x][y];

      if (Array.isArray(value)) {
        const dimensions =
          data["variables_data"][variable]["dimensions"].slice(2);
        current = {
          ...current,
          [variable]: value,
          dimensions,
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
