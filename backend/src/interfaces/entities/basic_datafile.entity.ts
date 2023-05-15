import { Entity } from "../common/entity.interface";

export interface BasicDatafile extends Entity {
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type BasicDatafileCreateParams = Pick<BasicDatafile, "title" | "description">;
export type BasicDatafileUpdateParams = Pick<BasicDatafile, "title" | "description">;