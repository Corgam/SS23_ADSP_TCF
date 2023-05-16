export interface CRUDService<Entity, CreateParams, UpdateParams> {
    create(createParams: CreateParams) : Promise<void>;
    get(id: string): Promise<Entity | null>;
    getAll(): Promise<Entity[]>;
    delete(id: string): Promise<void | null>;
    update(id: string, updateParams: UpdateParams): Promise<void>;
}