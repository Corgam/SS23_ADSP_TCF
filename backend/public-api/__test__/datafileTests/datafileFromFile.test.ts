import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Application } from "express";
import path from "path";
import DatafileSchema from "../../src/models/datafile.model";

describe("Checks if /fromFile and /attach for DataFile works", () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let id: string;
  let id_ref: string;

  beforeAll(async () => {
    // Create MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = new App().express;
    const response = await DatafileSchema.create(datafileObject);
    id = response._id;
    const response_ref = await DatafileSchema.create(datafileObjectRef);
    id_ref = response_ref._id;
  });

  afterAll(async () => {
    // Close MongoDB connection and server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Should return {"status":"200"} for CSV file on /fromFile', async () => {
    const response = await request(app)
      .post("/api/datafile/fromFile")
      .field("dataset", "CSV")
      .attach("file", path.join(__dirname, "../testFiles/test.csv"));
    expect(response.status).toBe(200);
  });

  it('Should return {"status":"200"} for SIMRA file on /fromFile', async () => {
    const response = await request(app)
      .post("/api/datafile/fromFile")
      .field("dataset", "SIMRA")
      .attach("file", path.join(__dirname, "../testFiles/simra"));
    expect(response.status).toBe(200);
  });

  it('Should return {"status":"400"} for unsuported datasets on /fromFile', async () => {
    const response = await request(app)
      .post("/api/datafile/fromFile")
      .field("dataset", "foo")
      .attach("file", path.join(__dirname, "../testFiles/test.csv"));
    expect(response.status).toBe(400);
  });

  it('Should return {"status":"200"} for CSV file on /attach', async () => {
    const response = await request(app)
      .post(`/api/datafile/${id}/attach`)
      .field("fileType", "CSV")
      .attach("file", path.join(__dirname, "../testFiles/test.csv"));
    expect(response.status).toBe(200);
  });

  it('Should return {"status":"200"} for TXT file on /attach', async () => {
    const response = await request(app)
      .post(`/api/datafile/${id}/attach`)
      .field("fileType", "TXT")
      .attach("file", path.join(__dirname, "../testFiles/simra"));
    expect(response.status).toBe(200);
  });

  it('Should return {"status":"200"} for JSON file on /attach', async () => {
    const response = await request(app)
      .post(`/api/datafile/${id}/attach`)
      .field("fileType", "JSON")
      .attach("file", path.join(__dirname, "../testFiles/test.json"));
    expect(response.status).toBe(200);
  });

  it('Should return {"status":"400"} for Referenced Datafile on /attach', async () => {
    const response = await request(app)
      .post(`/api/datafile/${id_ref}/attach`)
      .field("fileType", "CSV")
      .attach("file", path.join(__dirname, "../testFiles/test.csv"));
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text)).toEqual({
      message: "Selected file needs to be a NOTREFERENCED file type.",
    });
  });

  it('Should return {"status":"400"} for unsuported datasets on /attach', async () => {
    const response = await request(app)
      .post(`/api/datafile/${id}/attach`)
      .field("fileType", "foo")
      .attach("file", path.join(__dirname, "../testFiles/test.csv"));
    expect(response.status).toBe(400);
  });
});

const datafileObjectRef = {
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

const datafileObject = {
  ...datafileObjectRef,
  dataType: "NOTREFERENCED",
  content: {
    data: {
      foo: "bar",
    },
    location: datafileObjectRef.content.location,
  },
};
