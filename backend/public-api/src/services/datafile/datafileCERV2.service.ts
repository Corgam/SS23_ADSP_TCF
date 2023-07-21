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

export async function handleCERV2File(
  file: Express.Multer.File,
  tags = "",
  stepSize = 10,
  description?: string
) {
  const uploadId = uuidv4();

  const metadata = await handleNetCDFFileData(file, "/metadata");

  const locationVariableNames = getVariablesNamesWithLocationData(metadata);

  const tagList = [
    "CERv2",
    ...locationVariableNames,
    ...Array.from(tags.split(","), (tag) => tag.trim()),
  ];

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
    await datafileModel.create(datafile);
  }

  console.log("Finished creating datafiles.");
}

async function* createDatafiles(
  file: Express.Multer.File,
  metadata: any,
  locationVariableNames: string[],
  stepSize: number,
  tags: string[],
  uploadId: string,
  description?: string
) {
  const cerv2_var_gen = await handleNetCDFFileDataWithOptions(file, "/data", {
    filter: locationVariableNames,
    isCERv2: true,
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
      tags,
      traceId: uploadId,
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

// get variable names with location data
export function getVariablesNamesWithLocationData(metadata: any) {
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
