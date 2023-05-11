import express, { Application, Request, Response } from 'express';

// Constants
const PORT = process.env.PORT ? +process.env.PORT : 8080;
const HOST = "0.0.0.0";

// App
const app: Application = express();
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
