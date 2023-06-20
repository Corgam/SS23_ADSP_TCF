import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { checkArrayContainsObjects } from "../utils/helpers";
import { Application } from "express";
import DataFileSchema from "../../src/models/datafile.model";

let app: Application;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = new App().express;
  // Post documents
  await DataFileSchema.create(document1);
  await DataFileSchema.create(document2);
  await DataFileSchema.create(document3);
});

afterAll(async () => {
  // Close MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Checks if simple IN works (true)", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.data.boolean",
          operation: "IS",
          value: true,
          negate: false,
        },
      ],
    };
    // Send filter
    const response = await request(app)
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document2],
        JSON.parse(response.text)
      )
    ).toBe(true);
  });
});

describe("Checks if simple IN works (false)", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.data.boolean",
          operation: "IS",
          value: false,
          negate: false,
        },
      ],
    };
    // Send filter
    const response = await request(app)
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects([document3], JSON.parse(response.text))
    ).toBe(true);
  });
});

const document1 = {
  title: "SomeData",
  description: "Here is some nice description",
  dataType: "NOTREFERENCED",
  tags: ["test", "pic"],
  content: {
    data: {
      boolean: true,
    },
    location: {
      type: "Point",
      coordinates: [45, 45],
    },
  },
};
const document2 = {
  title: "SomeData",
  description: "Here is some nice description",
  dataType: "NOTREFERENCED",
  tags: ["test", "pic"],
  content: {
    data: {
      boolean: true,
    },
    location: {
      type: "Point",
      coordinates: [45, 45],
    },
  },
};
const document3 = {
  title: "SomeData",
  description: "Here is some nice description",
  dataType: "NOTREFERENCED",
  tags: ["test", "pic"],
  content: {
    data: {
      boolean: false,
    },
    location: {
      type: "Point",
      coordinates: [45, 45],
    },
  },
};
