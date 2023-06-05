import { initializeApp, App as FirebaseApp } from "firebase-admin/app";
import { Request } from "express";
import { getAuth } from "firebase-admin/auth";

import firebaseConfig from "./config/firebaseConfig";
import config from "./config/config";
import { UnauthorizedError } from "./errors";

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

export function expressAuthentication(
  request: Request,
  // from tsoa
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (config.DISABLE_AUTH) {
    return Promise.resolve({});
  }

  if (securityName === "firebase") {
    const idToken = (request.headers["Authorization"] as string)?.replace(
      "Bearer ",
      ""
    );

    if (!idToken) {
      return Promise.reject(new UnauthorizedError());
    }
    // idToken comes from the client app
    return getAuth(firebaseApp).verifyIdToken(idToken);
  }

  return Promise.reject({});
}
