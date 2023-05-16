import { Model, UpdateQuery, Document } from "mongoose";
import NotFoundError from "../errors/NotFoundError";

export abstract class BaseService<T extends Document,C,U> {
  constructor(
    private readonly model: Readonly<Model<T>>
  ) {}

  // Creates a single basic data file from provided JSON
  async create(createEntity: C): Promise<void> {
    // Create new basic data file
    // Save the basic data file into DB
    this.model.create(createEntity);
    return;
  };

  // Deletes the single basic data file with given ID
  async delete(id: string): Promise<void> {
    const file = await this.model.findByIdAndRemove(id, { useFindAndModify: false }).catch(console.log);

    if (!file) {
      throw new NotFoundError();
    }

    return;
  };

  // Updates a single basic data file by ID
  async update(id: string, updateParams: U): Promise<void> {
    const file = await this.model.findByIdAndUpdate<U>(id, updateParams as UpdateQuery<T>, {
      useFindAndModify: false,
    });

    if (!file) {
      throw new NotFoundError();
    }

    return;
  };

  // Returns a single basic data file by ID
  async get(id: string): Promise<T> {
    const file = await this.model.findById(id);

    if (!file) {
      throw new NotFoundError();
    }

    return file;
  };

  // Returns all basic data files
  async getAll(): Promise<T[]> {
    return this.model.find();
  };

}