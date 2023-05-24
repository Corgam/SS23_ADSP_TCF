import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import { NotFoundError, OperationNotFoundError } from "../errors";

function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      message: "Not Found",
    });
  }
  if (err instanceof OperationNotFoundError) {
    return res.status(400).json({
      message: "Operation not supported.",
    });
  }
  if (err instanceof Error) {
    console.warn(`Caught Error for ${req.path}:`, err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
}

export default errorMiddleware;
