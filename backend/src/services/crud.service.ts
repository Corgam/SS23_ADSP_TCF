import { Model, UpdateQuery } from "mongoose";
import { NotFoundError } from "../errors";

/**
 * BaseService
 *
 * Abstract base service class providing common CRUD operations for a Mongoose model.
 *
 * @typeparam T - The type of the Mongoose document.
 * @typeparam C - The type of the entity params used for creation.
 * @typeparam U - The type of the entity params used for update.
 */
export abstract class BaseService<T, C, U> {
  /**
   * Constructs the BaseService instance.
   *
   * @param model - The Mongoose model associated with the service.
   */
  constructor(protected readonly model: Readonly<Model<T>>) {
    this.model = model;
  }

  /**
   * Creates a new entity.
   *
   * @param createEntity - The entity to create.
   * @returns A promise that resolves to the created entity.
   */
  async create(createEntity: C): Promise<T> {
    const entity = this.model.create(createEntity);
    return entity;
  }

  /**
   * Deletes an entity by ID.
   *
   * @param id - The ID of the entity to delete.
   * @returns A promise that resolves to the deleted entity.
   * @throws NotFoundError if the entity is not found.
   */
  async delete(id: string): Promise<T> {
    const entity = await this.model
      .findByIdAndRemove(id, { useFindAndModify: false })
      .catch(console.log);

    if (!entity) {
      throw new NotFoundError();
    }

    return entity;
  }

  /**
   * Updates an entity by ID.
   *
   * @param id - The ID of the entity to update.
   * @param updateParams - The parameters to update.
   * @returns A promise that resolves to the updated entity.
   * @throws NotFoundError if the entity is not found.
   */
  async update(id: string, updateParams: U): Promise<T> {
    const entity = await this.model.findByIdAndUpdate(
      id,
      updateParams as UpdateQuery<T>,
      {
        useFindAndModify: false,
        new: true,
      }
    );

    if (!entity) {
      throw new NotFoundError();
    }

    return entity;
  }

  /**
   * Retrieves an entity by ID.
   *
   * @param id - The ID of the entity to retrieve.
   * @returns A promise that resolves to the retrieved entity.
   * @throws NotFoundError if the entity is not found.
   */
  async get(id: string): Promise<T> {
    const entity = await this.model.findById(id);

    if (!entity) {
      throw new NotFoundError();
    }

    return entity;
  }

  /**
   * Retrieves all entities.
   *
   * @returns A promise that resolves to an array of entities.
   */
  async getAll(): Promise<T[]> {
    return this.model.find();
  }
}
