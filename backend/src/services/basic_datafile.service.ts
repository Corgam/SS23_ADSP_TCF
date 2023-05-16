import { CRUDService } from "../interfaces/common/crud_service.interface";
import BasicDataFileModel from "../models/basic_datafile.model";
import {
  BasicDatafile,
  BasicDatafileCreateParams,
  BasicDatafileUpdateParams
} from "../interfaces/entities/basic_datafile.entity";

export class BasicDatafileService implements CRUDService<BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams> {
  private readonly basicDataFileModel = BasicDataFileModel;

  // Creates a single basic data file from provided JSON
  async create(responseBody: BasicDatafileCreateParams) {
    // Create new basic data file
    // Save the basic data file into DB
    await this.basicDataFileModel.create({
      title: responseBody.title,
      description: responseBody.description,
    });

    return;
  };

  // Deletes the single basic data file with given ID
  async delete(id: string): Promise<void> {
    await this.basicDataFileModel.findByIdAndRemove(id, { useFindAndModify: false });
    return;
  };

  // Updates a single basic data file by ID
  async update(id: string, updateParams: BasicDatafileUpdateParams): Promise<void> {
    await this.basicDataFileModel.findByIdAndUpdate(id, updateParams, {
      useFindAndModify: false,
    });

    return;
  };

  // Returns a single basic data file by ID
  async get(id: string): Promise<BasicDatafile | null> {
    return  this.basicDataFileModel.findById(id);
  };

  // Returns all basic data files
  async getAll(): Promise<BasicDatafile[]> {
    return this.basicDataFileModel.find();
  };

}