import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import {
  FailedToParseError,
  NotFoundError,
  OperationNotSupportedError,
  WrongObjectTypeError,
} from "../errors";
import mongoose from "mongoose";

function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    // Instance of a TypeScript validation error
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: err.message ? err.message : "TypeScript Validation Failed",
      details: err?.fields,
    });
  } else if (err instanceof NotFoundError) {
    return res.status(404).json({
      message: err.message ? err.message : "Not Found",
    });
  } else if (err instanceof OperationNotSupportedError) {
    // Signalize that operation is not supported.
    return res.status(400).json({
      message: err.message ? err.message : "Operation not supported.",
    });
  } else if (err instanceof WrongObjectTypeError) {
    // Signalize that wrong type of object was selected
    return res.status(400).json({
      message: err.message ? err.message : "Wrong type of object selected.",
    });
  } else if (err instanceof FailedToParseError) {
    // Failed to parse provided file
    return res.status(400).json({
      message: err.message ? err.message : "Failed to parse provided file.",
    });
  } else if (err instanceof mongoose.Error) {
    // Error of MongoDB if the document does not follow a schema
    console.warn(`Caught ${err.name} Error for ${req.path}:`, err);
    return res.status(500).json({
      message: err.message
        ? err.message
        : "Database's Schema Validation Failed",
      details: err.message,
    });
  } else if (err instanceof SyntaxError) {
    // Most often is thrown when provided JSON has a syntax mistake
    return res.status(400).json({
      message: err.message ? err.message : "Syntax Error",
      details: err.message,
    });
  } else if (err instanceof Error) {
    console.warn(`Caught ${err.name} Error for ${req.path}:`, err);
    return res.status(500).json({
      message: err.message ? err.message : "Internal Server Error",
      details: "Look at the console for more details.",
    });
  }
  next();
}

export default errorMiddleware;
