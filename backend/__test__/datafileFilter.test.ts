import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { checkArrayContainsObjects } from "./utils/helper";
import { Application } from "express";

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

const query5 = {
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

let app: Application;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = new App().express;

  // Post files
  await request(app).post("/api/datafiles").send(query);
  await request(app).post("/api/datafiles").send(query2);
  await request(app).post("/api/datafiles").send(query3);
  await request(app).post("/api/datafiles").send(query4);
  await request(app).post("/api/datafiles").send(query5);
});

afterAll(async () => {
  // Close MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Checks if AND + NOT boolean operations works", () => {
  const filter = {
    filterSet: [
      {
        booleanOperation: "AND",
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
    // Compare the response object to the posted object
    expect(checkArrayContainsObjects([query], JSON.parse(response.text))).toBe(
      true
    );
  });
});

describe("Checks if AND boolean operations works", () => {
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
      checkArrayContainsObjects([query, query3], JSON.parse(response.text))
    ).toBe(true);
  });
});

describe("Checks if simple filtering works", () => {
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
      checkArrayContainsObjects([query2, query5], JSON.parse(response.text))
    ).toBe(true);
  });
});

describe("Checks if NOT boolean operations works", () => {
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
        [query, query3, query4],
        JSON.parse(response.text)
      )
    ).toBe(true);
  });
});

describe("Checks if OR boolean operations works", () => {
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
        [query, query2, query4],
        JSON.parse(response.text)
      )
    ).toBe(true);
  });
});
