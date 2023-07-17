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

describe("Checks if simple EQ works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.data.number",
          operation: "EQ",
          value: 10,
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
    expect(checkArrayContainsObjects([document1], results)).toBe(true);
  });
});

describe("Checks if simple GT works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.data.number",
          operation: "GT",
          value: 10,
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
    expect(checkArrayContainsObjects([document2, document3], results)).toBe(
      true
    );
  });
});

describe("Checks if simple GTE works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.data.number",
          operation: "GTE",
          value: 10,
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
    expect(
      checkArrayContainsObjects([document1, document2, document3], results)
    ).toBe(true);
  });
});

describe("Checks if simple LT works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.data.number",
          operation: "LT",
          value: 15,
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
    expect(checkArrayContainsObjects([document1], results)).toBe(true);
  });
});

describe("Checks if simple LTE works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.data.number",
          operation: "LTE",
          value: 15,
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
    expect(checkArrayContainsObjects([document1, document2], results)).toBe(
      true
    );
  });
});

const document1 = {
  title: "SomeData",
  description: "Here is some nice description",
  dataType: "NOTREFERENCED",
  tags: ["test", "pic"],
  dataSet: "NONE",
  content: {
    data: {
      number: 10,
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
  dataSet: "NONE",
  content: {
    data: {
      number: 15,
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
  dataSet: "NONE",
  content: {
    data: {
      number: 50,
    },
    location: {
      type: "Point",
      coordinates: [45, 45],
    },
  },
};
