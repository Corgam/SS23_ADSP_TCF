import request from "supertest";
import { expect, describe, it, beforeAll } from "@jest/globals";
import App from "../src/app";

const app = new App();

describe("GET /", () => {
  beforeAll(async () => {
    await app.listen();
  });

  it("should return {\"status\":\"healthy\"}", async () => {
    const response = await request(app.express).get("/health");
    expect(response.status).toBe(200);
    expect(response.text).toBe("{\"status\":\"healthy\"}");
  });
});
