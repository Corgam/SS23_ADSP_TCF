import db from "../models/db";

import { CRUDService } from "../interfaces/common/crud_service.interface";
import { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../interfaces/entities/basic_datafile.entity";
const BasicDataFile = db.basicDataFileSchema;

export class BasicDatafileService implements CRUDService<BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams> {

  // Creates a single basic data file from provided JSON
  create(responseBody: BasicDatafileCreateParams) {
    // Create new basic data file
    const datafile = new BasicDataFile({
      title: responseBody.title,
      description: responseBody.description,
    });
    // Save the basic data file into DB
    return datafile.save(datafile)
  };

  // Deletes the single basic data file with given ID
  delete(id: string): Promise<void> {
    return BasicDataFile.findByIdAndRemove(id, { useFindAndModify: false });
  };

  // Updates a single basic data file by ID
  update(id: string, updateParams: BasicDatafileUpdateParams): Promise<void> {
    return BasicDataFile.findByIdAndUpdate(id, updateParams, {
      useFindAndModify: false,
    })
  };

  // Returns a single basic data file by ID
  get(id: string): Promise<BasicDatafile> {
    return BasicDataFile.findById(id);
  };

  // Returns all basic data files
  getAll(): Promise<BasicDatafile[]> {
    return BasicDataFile.find();
  };

}