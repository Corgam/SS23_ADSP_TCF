import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Application } from "express";

describe("Checks if /nestedValues works", () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let docID: string;

  beforeAll(async () => {
    // Create MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = new App().express;
    // Post a single document
    const response = await request(app).post("/api/datafile").send(document);
    // Get the document id
    docID = JSON.parse(response.text)["_id"];
  });

  afterAll(async () => {
    // Close MongoDB connection and server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("Should return 'bar' with status code 200", async () => {
    const response = await request(app).get(
      `/api/datafile/nestedValue/${docID}/content.data.foo/false`
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toEqual("bar");
  });

  it("Should return NotFoundError with status code 404", async () => {
    const response = await request(app).get(
      `/api/datafile/nestedValue/${docID}/content.data.bar/false`
    );
    expect(response.status).toBe(404);
    expect(JSON.parse(response.text)).toEqual({
      message: "no key is found for the path content.data.bar",
    });
  });

  it("Should return 'bar' with status code 200 and delete the key data", async () => {
    const response = await request(app).get(
      `/api/datafile/nestedValue/${docID}/content.data.foo/true`
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toEqual("bar");
    const updatedRes = await request(app).get(`/api/datafile/${docID}`);
    expect("data" in (JSON.parse(updatedRes.text)?.content ?? {})).toBe(false);
  });

  it("Should return the updated Document with a new element in the array", async () => {
    const response = await request(app)
      .post(`/api/datafile/nestedValue/${docID}`)
      .send({
        path: "tags[2]",
        value: "foo",
      });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).tags).toEqual(["test", "pic", "foo"]);
  });

  it("Should return the updated Document with a new key", async () => {
    const response = await request(app)
      .post(`/api/datafile/nestedValue/${docID}`)
      .send({
        path: "content.data.foo",
        value: "bar",
      });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).content).toEqual({
      data: {
        foo: "bar",
      },
      location: {
        type: "Point",
        coordinates: [45, 45],
      },
    });
  });
});

const document = {
  title: "SomeData",
  description: "Here is some nice description",
  dataType: "NOTREFERENCED",
  tags: ["test", "pic"],
  dataSet: "NONE",
  content: {
    data: {
      foo: "bar",
    },
    location: {
      type: "Point",
      coordinates: [45, 45],
    },
  },
};
