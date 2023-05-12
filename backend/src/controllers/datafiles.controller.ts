import { Request, Response } from "express";

exports.createDataFile = (req: Request, res: Response) => {
  console.log("[REQ]: Create new datafile.");
  res.send("Created new datafile.");
};
