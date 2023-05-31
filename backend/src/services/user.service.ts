import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, Auth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import firebaseConfig from "../config/firebaseConfig";

/**
 * Service for user registration, login, and logout using Firebase authentication.
 */
export default class UserService {
  private readonly firebaseApp: Readonly<FirebaseApp> = initializeApp(firebaseConfig);
  private readonly auth: Readonly<Auth> = getAuth(this.firebaseApp);

  /**
   * Register a new user with the provided email and password.
   * @param email - User email address.
   * @param password - User password.
   * @returns Promise resolved when user registration is successful.
   */
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Sign in a user with the provided email and password.
   * @param email - User email address.
   * @param password - User password.
   * @returns Promise resolved with user information on successful login.
   */
  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Sign out the currently authenticated user.
   * @returns Promise resolved when user logout is successful.
   */
  signOut() {
    return signOut(this.auth);
  }
}