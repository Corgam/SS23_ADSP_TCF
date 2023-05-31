import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import { FirebaseError } from "firebase/app";
import { AuthErrorCodes } from "firebase/auth";

import { NotFoundError } from "../errors";

function handleFirebaseError(err: FirebaseError): [httpErrorCode: number, message: string] {
  switch (err.code) {
  case AuthErrorCodes.WEAK_PASSWORD:
    return [422, "The password is too weak"];
  case AuthErrorCodes.EMAIL_EXISTS:
    return [409, "The email address is already in use"];
  case AuthErrorCodes.INVALID_EMAIL:
    return [422, "Invalid email address"];
  case AuthErrorCodes.INVALID_PASSWORD:
  case AuthErrorCodes.USER_DELETED:
    return [422, "The email address or password is incorrect"];
  default:
    return [400, "Bad Request"];
  }
}

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
  if (err instanceof FirebaseError) {
    const [errorCode, message] = handleFirebaseError(err);

    return res.status(errorCode).json({
      message
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
