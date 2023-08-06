import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { compareSingleJson } from "../utils/helpers";
import { Application } from "express";
import JourneySchema from "../../src/models/journey.model";

describe("Checks if simple DELETE for Journey", () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let id: string;

  beforeAll(async () => {
    // Create MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = new App().express;
    const response = await JourneySchema.create(journeyObject);
    id = response._id;
  });

  afterAll(async () => {
    // Close MongoDB connection and server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns {"status":"200"} for existing ID', async () => {
    const response = await request(app).delete(`/api/journey/${id}`);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(compareSingleJson(journeyObject, JSON.parse(response.text))).toBe(
      true
    );
  });

  it('returns {"status":"404"} for non-existing ID', async () => {
    const differentID = new mongoose.Types.ObjectId(1);
    const response = await request(app).delete(`/api/journey/${differentID}`);
    // Check the response status
    expect(response.status).toBe(404);
  });
});

const journeyObject = {
  title: "Journey",
  description: "This is a journey",
  tags: ["these", "are", "tags"],
  author: "John Doe",
  parentID: "646365496740ded7a396f5d0",
  visibility: "PUBLIC",
  collections: [
    {
      title: "sample",
      filterSet: [
        {
          key: "tags",
          operation: "CONTAINS",
          value: "pic",
          negate: false,
        },
      ],
    },
  ],
  excludedIDs: ["646365496740ded7a396f5d1"],
};
