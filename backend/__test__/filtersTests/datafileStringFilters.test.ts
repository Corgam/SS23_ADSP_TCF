import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { checkArrayContainsObjects } from "../utils/helpers";
import { Application } from "express";

let app: Application;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = new App().express;
  // Post documents
  await request(app).post("/api/datafiles").send(document1);
  await request(app).post("/api/datafiles").send(document2);
  await request(app).post("/api/datafiles").send(document3);
  await request(app).post("/api/datafiles").send(document4);
  await request(app).post("/api/datafiles").send(document5);
  await request(app).post("/api/datafiles").send(document6);
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
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document2, document5],
        JSON.parse(response.text)
      )
    ).toBe(true);
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
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document3, document4, document6],
        JSON.parse(response.text)
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
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects([document4], JSON.parse(response.text))
    ).toBe(true);
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
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document2, document3, document5, document6],
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
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    coords: {
      longitude: 0,
      latitude: 0,
    },
  },
};
const document2 = {
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
const document3 = {
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
const document4 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "banana1"],
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    coords: {
      longitude: 0,
      latitude: 0,
    },
  },
};

const document5 = {
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
const document6 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "banana"],
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    coords: {
      longitude: 0,
      latitude: 0,
    },
  },
};
