import { Model, UpdateQuery, Document } from "mongoose";
import NotFoundError from "../errors/notFound.error";

/**
 * BaseService
 *
 * Abstract base service class providing common CRUD operations for a Mongoose model.
 *
 * @typeparam T - The type of the Mongoose document.
 * @typeparam C - The type of the entity params used for creation.
 * @typeparam U - The type of the entity params used for update.
 */
export abstract class BaseService<T extends Document, C, U> {
  /**
   * Constructs the BaseService instance.
   *
   * @param model - The Mongoose model associated with the service.
   */
  constructor(protected readonly model: Readonly<Model<T>>) {}

  /**
   * Creates a new entity.
   *
   * @param createEntity - The entity to create.
   * @returns A promise that resolves to void if succeeded
   */
  async create(createEntity: C): Promise<void> {
    this.model.create(createEntity);
    return;
  }

  /**
   * Deletes an entity by ID.
   *
   * @param id - The ID of the entity to delete.
   * @returns A promise that resolves to void.
   * @throws NotFoundError if the entity is not found.
   */
  async delete(id: string): Promise<void> {
    const entity = await this.model.findByIdAndRemove(id, { useFindAndModify: false }).catch(console.log);

    if (!entity) {
      throw new NotFoundError();
    }

    return;
  }

  /**
   * Updates an entity by ID.
   *
   * @param id - The ID of the entity to update.
   * @param updateParams - The parameters to update.
   * @returns A promise that resolves to void.
   * @throws NotFoundError if the entity is not found.
   */
  async update(id: string, updateParams: U): Promise<void> {
    const entity = await this.model.findByIdAndUpdate<U>(id, updateParams as UpdateQuery<T>, {
      useFindAndModify: false,
    });

    if (!entity) {
      throw new NotFoundError();
    }

    return;
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