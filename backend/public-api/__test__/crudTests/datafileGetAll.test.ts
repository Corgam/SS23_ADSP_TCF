import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { checkArrayContainsObjects } from "../utils/helpers";
import { Application } from "express";

describe("Checks if GET all documents works", () => {
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

  it("Should return all posted documents", async () => {
    // FIRST GET
    // Post a single document
    await request(app).post("/api/datafiles").send(document1);
    await request(app).post("/api/datafiles").send(document2);
    // Set GET request
    let response = await request(app).get("/api/datafiles/limit=15&skip=0");
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document2],
        JSON.parse(response.text)
      )
    ).toBe(true);
    // SECOND GET
    await request(app).post("/api/datafiles").send(document3);
    // Set GET request
    response = await request(app).get("/api/datafiles/limit=15&skip=0");
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document2, document3],
        JSON.parse(response.text)
      )
    ).toBe(true);
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
const document2 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "test", "photo"],
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
const document3 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "new"],
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
