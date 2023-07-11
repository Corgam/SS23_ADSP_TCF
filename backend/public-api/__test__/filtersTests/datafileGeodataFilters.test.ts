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
});

afterAll(async () => {
  // Close MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Checks if simple RADIUS works (10km)", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.location",
          operation: "RADIUS",
          value: {
            center: [52.530173, 13.418964],
            radius: 10,
          },
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

describe("Checks if simple RADIUS works (250km)", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.location",
          operation: "RADIUS",
          value: {
            center: [52.530173, 13.418964],
            radius: 250,
          },
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
      checkArrayContainsObjects([document1, document2, document4], results)
    ).toBe(true);
  });
});

describe("Checks if simple negative RADIUS works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.location",
          operation: "RADIUS",
          value: {
            center: [52.530173, 13.418964],
            radius: 10,
          },
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
    expect(checkArrayContainsObjects([document3, document4], results)).toBe(
      true
    );
  });
});

describe("Checks if simple smaller AREA works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.location",
          operation: "AREA",
          value: {
            vertices: [
              [52.65215, 14.078649],
              [52.097911, 13.618036],
              [52.335128, 12.590001],
              [52.896474, 13.110694],
              [52.65215, 14.078649],
            ],
          },
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
describe("Checks if simpler bigger AREA works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.location",
          operation: "AREA",
          value: {
            vertices: [
              [52.585565, 15.205154],
              [51.919851, 14.577457],
              [52.335128, 12.590001],
              [52.896474, 13.110694],
              [52.585565, 15.205154],
            ],
          },
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
      checkArrayContainsObjects([document1, document2, document4], results)
    ).toBe(true);
  });
});

describe("Checks if a negation of a simpler bigger AREA works", () => {
  it('Should return {"status":"200"}', async () => {
    const filter = {
      filterSet: [
        {
          key: "content.location",
          operation: "AREA",
          value: {
            vertices: [
              [52.585565, 15.205154],
              [51.919851, 14.577457],
              [52.335128, 12.590001],
              [52.896474, 13.110694],
              [52.585565, 15.205154],
            ],
          },
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
    expect(checkArrayContainsObjects([document3], results)).toBe(true);
  });
});

const document1 = {
  title: "Berlin Park",
  description: "Some photo from Berlin Park",
  dataType: "REFERENCED",
  tags: ["test", "pic"],
  dataSet: "NONE",
  content: {
    url: "someURLstring",
    mediaType: "PHOTO",
    location: {
      type: "Point",
      coordinates: [52.531029, 13.413444],
    },
  },
};
const document2 = {
  title: "Berlin Club",
  description: "Some other photo from Berlin's party",
  dataType: "REFERENCED",
  tags: ["test", "pic"],
  dataSet: "NONE",
  content: {
    url: "someURLstring",
    mediaType: "PHOTO",
    location: {
      type: "Point",
      coordinates: [52.542453, 13.37759],
    },
  },
};
const document3 = {
  title: "Warsaw Restaurant",
  description: "Some photo from restaurant in Warsaw",
  dataType: "REFERENCED",
  tags: ["test", "pic"],
  dataSet: "NONE",
  content: {
    url: "someURLstring",
    mediaType: "PHOTO",
    location: {
      type: "Point",
      coordinates: [52.193696, 20.997325],
    },
  },
};
const document4 = {
  title: "Frankfurt Oder Restaurant",
  description: "Some photo from restaurant in Frankfurt Oder",
  dataType: "REFERENCED",
  tags: ["test", "pic"],
  dataSet: "NONE",
  content: {
    url: "someURLstring",
    mediaType: "PHOTO",
    location: {
      type: "Point",
      coordinates: [52.331049, 14.549275],
    },
  },
};
