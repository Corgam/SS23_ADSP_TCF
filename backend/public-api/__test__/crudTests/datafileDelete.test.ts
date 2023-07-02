import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { compareSingleJson } from "../utils/helpers";
import { Application } from "express";

describe("Checks if simple DELETE for DataFile works", () => {
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

  it('Should return {"status":"404"}', async () => {
    // Post a single document
    let response = await request(app).post("/api/datafile").send(document1);
    // Get the document id
    const docID = JSON.parse(response.text)["_id"];
    // Set GET request
    response = await request(app).get(`/api/datafile/${docID}`);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(compareSingleJson(document1, JSON.parse(response.text))).toBe(true);
    // Delete the file
    response = await request(app)
      .delete(`/api/datafile/${docID}`)
      .send(document1);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(compareSingleJson(document1, JSON.parse(response.text))).toBe(true);
    // Get the new file
    response = await request(app).get(`/api/datafile/${docID}`);
    // Check the response status
    expect(response.status).toBe(404);
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
