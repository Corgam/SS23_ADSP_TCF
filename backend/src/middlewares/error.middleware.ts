import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import {
  NotFoundError,
  OperationNotFoundError,
  UnauthorizedError,
} from "../errors";
import mongoose from "mongoose";

function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  // Instance of a TypeScript validation error
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "TypeScript Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      message: "Not Found",
    });
  }
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      message: "Access denied. Please provide valid credentials.",
    });
  }
  if (err instanceof OperationNotFoundError) {
    return res.status(400).json({
      message: "Operation not supported.",
    });
  }
  // Error of MongoDB if the document does not follow a schema
  if (err instanceof mongoose.Error) {
    console.warn(`Caught ${err.name} Error for ${req.path}:`, err);
    return res.status(500).json({
      message: "Database's Schema Validation Failed",
      details: err.message,
    });
  }
  // Most often is thrown when provided JSON has a syntax mistake
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      message: "Syntax Error",
      details: err.message,
    });
  }
  if (err instanceof Error) {
    console.warn(`Caught ${err.name} Error for ${req.path}:`, err);
    return res.status(500).json({
      message: "Internal Server Error",
      details: "Look at the console for more details.",
    });
  }

  next();
}

export default errorMiddleware;
