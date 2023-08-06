import request from "supertest";
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import App from "../../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Application } from "express";
import path from "path";

describe("Checks if /fromFile for DataFile works", () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Create MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = new App().express;
  });

  afterAll(async () => {
    // Close MongoDB connection and server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Should return {"status":"200"} for CSV file', async () => {
    const response = await request(app)
      .post("/api/datafile/fromFile")
      .field("dataset", "CSV")
      .attach("file", path.join(__dirname, "../testFiles/test.csv"));
    expect(response.status).toBe(200);
  });

  it('Should return {"status":"200"} for SIMRA file', async () => {
    const response = await request(app)
      .post("/api/datafile/fromFile")
      .field("dataset", "SIMRA")
      .attach("file", path.join(__dirname, "../testFiles/simra"));
    expect(response.status).toBe(200);
  });

  it('Should return {"status":"400"} for unsuported datasets', async () => {
    const response = await request(app)
      .post("/api/datafile/fromFile")
      .field("dataset", "foo")
      .attach("file", path.join(__dirname, "../testFiles/test.csv"));
    expect(response.status).toBe(400);
  });
});
