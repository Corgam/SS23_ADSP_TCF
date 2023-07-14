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
  await DataFileSchema.create(document4);
  await DataFileSchema.create(document5);
  await DataFileSchema.create(document6);
});

afterAll(async () => {
  // Close MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Checks if simple CONTAINS works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "tags",
          operation: "CONTAINS",
          value: "test",
          negate: false,
        },
      ],
    };
    // Send filter
    const response = await request(app)
      .post("/api/datafile/filter/limit=15&skip=0&onlyMetadata=false")
      .send(filter);
    const results = JSON.parse(response.text)["results"];
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(checkArrayContainsObjects([document2, document5], results)).toBe(
      true
    );
  });
});

describe("Checks if negative CONTAINS works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "tags",
          operation: "CONTAINS",
          value: "test",
          negate: true,
        },
      ],
    };
    // Send filter
    const response = await request(app)
      .post("/api/datafile/filter/limit=15&skip=0&onlyMetadata=false")
      .send(filter);
    const results = JSON.parse(response.text)["results"];
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document3, document4, document6],
        results
      )
    ).toBe(true);
  });
});

describe("Checks if simple MATCHES works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "tags",
          operation: "MATCHES",
          value: "banana1",
          negate: false,
        },
      ],
    };
    // Send filter
    const response = await request(app)
      .post("/api/datafile/filter/limit=15&skip=0&onlyMetadata=false")
      .send(filter);
    const results = JSON.parse(response.text)["results"];
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(checkArrayContainsObjects([document4], results)).toBe(true);
  });
});

describe("Checks if negative MATCHES works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "tags",
          operation: "MATCHES",
          value: "banana1",
          negate: true,
        },
      ],
    };
    // Send filter
    const response = await request(app)
      .post("/api/datafile/filter/limit=15&skip=0&onlyMetadata=false")
      .send(filter);
    const results = JSON.parse(response.text)["results"];
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document2, document3, document5, document6],
        results
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
const document4 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "banana1"],
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

const document5 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "test"],
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
const document6 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "banana"],
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
