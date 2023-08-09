import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { checkArrayContainsObjects } from "../utils/helpers";
import { Application } from "express";
import DataFileSchema from "../../src/models/datafile.model";

describe("Checks if GET all documents works", () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Create MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = new App().express;
    await DataFileSchema.create(document1);
    await DataFileSchema.create(document2);
  });

  afterAll(async () => {
    // Close MongoDB connection and server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("Should return all documents", async () => {
    const response = await request(app).get(
      "/api/datafile/limit=15&skip=0&onlyMetadata=false"
    );
    const results = JSON.parse(response.text)["results"];
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(checkArrayContainsObjects([document1, document2], results)).toBe(
      true
    );
    expect("data" in results[1]["content"]).toBe(true);
  });

  it("Should return only Metadata", async () => {
    // Set GET request
    const response = await request(app).get(
      "/api/datafile/limit=15&skip=0&onlyMetadata=true"
    );
    const results = JSON.parse(response.text)["results"];
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(checkArrayContainsObjects([document1, document2], results)).toBe(
      true
    );
    expect("data" in results[1]["content"]).toBe(false);
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
  title: "Other data",
  description: "This is data",
  dataType: "NOTREFERENCED",
  tags: ["pic", "test", "photo"],
  dataSet: "NONE",
  content: {
    data: {
      foo: "bar",
    },
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  },
};

const document3 = {
  title: "Other data",
  description: "This is data",
  dataType: "NOTREFERENCED",
  tags: ["pic", "test", "photo"],
  dataSet: "NONE",
  content: {
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  },
};
