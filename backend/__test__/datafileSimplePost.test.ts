import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { compareSingleJson } from "./helper.test";
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
    const query = {
      title: "CatPicture",
      description: "Some pretty cat!",
      dataType: "REFERENCED",
      tags: ["pic", "new", "photo"],
      content: {
        url: "someUrl",
        mediaType: "VIDEO",
        coords: {
          longitude: 0,
          latitude: 0,
        },
      },
    };
    const response = await request(app).post("/api/datafiles").send(query);

    // Check the response status
    expect(response.status).toBe(201);
    // Compare the response object to the posted object
    expect(compareSingleJson(query, JSON.parse(response.text), true)).toBe(
      true
    );
  });
});
