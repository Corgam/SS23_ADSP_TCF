import { CRUDService } from "../interfaces/common/crud_service.interface";
import BasicDataFileModel from "../models/basic_datafile.model";
import {
  BasicDatafile,
  BasicDatafileCreateParams,
  BasicDatafileUpdateParams
} from "../interfaces/entities/basic_datafile.entity";
import NotFoundError from "../errors/NotFound.error";

export class BasicDatafileService implements CRUDService<BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams> {
  private readonly basicDataFileModel = BasicDataFileModel;

  // Creates a single basic data file from provided JSON
  async create(datafile: BasicDatafileCreateParams): Promise<void> {
    // Create new basic data file
    // Save the basic data file into DB
    this.basicDataFileModel.create(datafile);

    return;
  };

  // Deletes the single basic data file with given ID
  async delete(id: string): Promise<void> {
    const file = await this.basicDataFileModel.findByIdAndRemove(id, { useFindAndModify: false }).catch(console.log);

    if (!file) {
      throw new NotFoundError();
    }

    return;
  };

  // Updates a single basic data file by ID
  async update(id: string, updateParams: BasicDatafileUpdateParams): Promise<void> {
    const file = await this.basicDataFileModel.findByIdAndUpdate(id, updateParams, {
      useFindAndModify: false,
    });

    if (!file) {
      throw new NotFoundError();
    }

    return;
  };

  // Returns a single basic data file by ID
  async get(id: string): Promise<BasicDatafile> {
    const file = await this.basicDataFileModel.findById(id);

    if (!file) {
      throw new NotFoundError();
    }

    return file;
  };

  // Returns all basic data files
  async getAll(): Promise<BasicDatafile[]> {
    return this.basicDataFileModel.find();
  };

}