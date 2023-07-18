import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { compareSingleJson } from "../utils/helpers";
import { Application } from "express";

describe("Checks if simple POST for DataFile works", () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Create MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = new App().express;
  });

  afterAll(async () => {
    // Close MongoDB connection and server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Should return {"status":"200"}', async () => {
    // Post a single document
    const response = await request(app).post("/api/datafile").send(document1);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(compareSingleJson(document1, JSON.parse(response.text))).toBe(true);
  });
});

const document1 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "new", "photo"],
  dataSet: "NONE",
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  },
};
