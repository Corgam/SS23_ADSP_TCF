import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { checkArrayContainsObjects, compareSingleJson } from "../utils/helpers";
import { Application } from "express";
import JourneySchema from "../../src/models/journey.model";

describe("Checks if simple GET for Journey", () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let id: string;

  beforeAll(async () => {
    // Create MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = new App().express;
    const response = await JourneySchema.create(journeyObject1);
    await JourneySchema.create(journeyObject2);
    id = response._id;
  });

  afterAll(async () => {
    // Close MongoDB connection and server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns {"status":"200"} for existing ID', async () => {
    const response = await request(app).get(`/api/journey/${id}`);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(compareSingleJson(journeyObject1, JSON.parse(response.text))).toBe(
      true
    );
  });

  it('returns {"status":"404"} for non-existing ID', async () => {
    const differentID = new mongoose.Types.ObjectId(1);
    const response = await request(app).get(`/api/journey/${differentID}`);
    // Check the response status
    expect(response.status).toBe(404);
  });

  it('returns all journeys for /limit=100&skip=0 and {"status":"200"}', async () => {
    const response = await request(app).get("/api/journey/limit=100&skip=0");
    // Check the response status
    expect(response.status).toBe(200);
    const results = JSON.parse(response.text)["results"];
    expect(
      checkArrayContainsObjects([journeyObject1, journeyObject2], results)
    ).toBe(true);
  });
});

const journeyObject1 = {
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

const journeyObject2 = {
  ...journeyObject1,
  title: "Journey Number 2",
  tags: [...journeyObject1.tags, "new"],
};
