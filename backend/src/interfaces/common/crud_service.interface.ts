export interface CRUDService<Entity, CreateParams, UpdateParams> {
    create(createParams: CreateParams) : Promise<void>;
    get(id: string): Promise<Entity>;
    getAll(): Promise<Entity[]>;
    delete(id: string): Promise<void>;
    update(id: string, updateParams: UpdateParams): Promise<void>;
}