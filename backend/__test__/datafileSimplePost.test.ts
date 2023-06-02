import request from "supertest";
import { expect, describe, it } from "@jest/globals";
import App from "../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { compareSingleJson } from "./helper.test";

// Create app
const app: App = new App();

describe("Checks if simple POST for DataFile works", () => {
  it('Should return {"status":"200"}', async () => {
    // Create MongoDB
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
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
    const response = await request(app.express)
      .post("/api/datafiles")
      .send(query);
    // Check the response status
    expect(response.status).toBe(201);
    // Compare the response object to the posted object
    expect(compareSingleJson(query, JSON.parse(response.text), true)).toBe(
      true
    );
    // Close MongoDB
    mongoose.connection.destroy();
  });
});
