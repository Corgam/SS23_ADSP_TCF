import request from "supertest";
import { expect, describe, it } from "@jest/globals";
import App from "../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { checkArrayContainsObjects } from "./helper.test";

// Create app
const app: App = new App();

describe("Checks if AND boolean operations works", () => {
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
    const query2 = {
      title: "CatPicture",
      description: "Some pretty cat!",
      dataType: "REFERENCED",
      tags: ["pic", "test", "photo"],
      content: {
        url: "someUrl",
        mediaType: "VIDEO",
        coords: {
          longitude: 0,
          latitude: 0,
        },
      },
    };
    const query3 = {
      title: "CatPicture",
      description: "Some pretty cat!",
      dataType: "REFERENCED",
      tags: ["pic", "new"],
      content: {
        url: "someUrl",
        mediaType: "VIDEO",
        coords: {
          longitude: 0,
          latitude: 0,
        },
      },
    };
    const query4 = {
      title: "CatPicture",
      description: "Some pretty cat!",
      dataType: "REFERENCED",
      tags: ["pic", "test"],
      content: {
        url: "someUrl",
        mediaType: "VIDEO",
        coords: {
          longitude: 0,
          latitude: 0,
        },
      },
    };
    const filter = {
      filterSet: [
        {
          booleanOperation: "AND",
          filters: [
            {
              key: "tags",
              operation: "CONTAINS",
              value: "pic",
              negate: false,
            },
            {
              key: "tags",
              operation: "CONTAINS",
              value: "new",
              negate: false,
            },
          ],
        },
      ],
    };
    // Post files
    await request(app.express).post("/api/datafiles").send(query);
    await request(app.express).post("/api/datafiles").send(query2);
    await request(app.express).post("/api/datafiles").send(query3);
    await request(app.express).post("/api/datafiles").send(query4);
    // Send filter
    const response = await request(app.express)
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects([query, query3], JSON.parse(response.text))
    ).toBe(true);
    // Close MongoDB
    mongoose.connection.destroy();
  });
});
