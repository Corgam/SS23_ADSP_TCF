import { initializeApp, App as FirebaseApp } from "firebase-admin/app";
import { Request } from "express";
import { getAuth } from "firebase-admin/auth";
import config from "./config/config";
import { UnauthorizedError } from "./errors";

// Firebase app
const firebaseApp: FirebaseApp = initializeApp(config.FIREBASE_CONFIG);

/**
 * Authenticate Express routes using Firebase Authentication, used as a middleware to handle authentication for routes.
 *
 * @param request - The Express Request object.
 * @param securityName - The name of the security scheme to be used for authentication (e.g., "firebase").
 * @param scopes - An optional array of scopes required for the authentication (not used in this function).
 * @returns A Promise resolving to the authenticated user's information, or rejecting with an error.
 */
export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  // Check if Swagger authentication is disabled in the configuration.
  if (config.DISABLE_SWAGGER_AUTH) {
    return Promise.resolve({});
  }
  if (securityName === "firebase") {
    // Extract the Firebase ID token from the "Authorization" header.
    const idToken = (request.headers["authorization"] as string)?.replace(
      "Bearer ",
      ""
    );
    // If the ID token is missing, reject the Promise with an "UnauthorizedError".
    if (!idToken) {
      return Promise.reject(new UnauthorizedError());
    }
    // Verify the authenticity of the Firebase ID token using the Firebase Admin SDK.
    return getAuth(firebaseApp).verifyIdToken(idToken);
  }
  return Promise.reject({});
}
