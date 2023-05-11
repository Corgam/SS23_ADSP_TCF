import express, { Application, Request, Response } from "express";

// App
const app: Application = express();
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

export default app;