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
});

afterAll(async () => {
  // Close MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Checks if AND + NOT boolean concatenation works", () => {
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
            value: "test",
            negate: true,
          },
        ],
      },
    ],
  };
  it('Should return {"status":"200"}', async () => {
    // Send filter
    const response = await request(app)
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    JSON.parse(response.text);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document3, document4],
        JSON.parse(response.text)
      )
    ).toBe(true);
  });
});

describe("Checks if AND boolean concatenation works", () => {
  it('Should return {"status":"200"}', async () => {
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
    // Send filter
    const response = await request(app)
      .post("/api/datafiles/filter")
      .send(filter);
    // Check the response status
    expect(response.status).toBe(200);
    // Compare the response object to the posted object
    expect(
      checkArrayContainsObjects(
        [document1, document3],
        JSON.parse(response.text)
      )
    ).toBe(true);
  });
});

describe("Checks if OR boolean concatenation works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          booleanOperation: "OR",
          filters: [
            {
              key: "tags",
              operation: "CONTAINS",
              value: "photo",
              negate: false,
            },
            {
              key: "tags",
              operation: "CONTAINS",
              value: "banana",
              negate: false,
            },
          ],
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
        [document1, document2, document4],
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
  tags: ["pic", "banana"],
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
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  },
};
