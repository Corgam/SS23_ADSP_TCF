import { environment as frontendEnvironment } from "../../../../frontend/src/environments/environment";

export default {
  // URL of the MongoDB database to connect to.
  // With Docker, the name of the container can also be provided instead of the IP address.
  // Here: mongodb://<IP>:<PORT>/<COLLECTION_NAME>
  MONGODB_URL: process.env.MONGODB_URL ?? "mongodb://localhost:27017/datastore",
  // Port of the express server
  PORT: process.env.PORT ?? 40000,
  // IP of the express server
  HOST: process.env.HOST ?? "localhost",
  // Disabled swagger authentication,
  DISABLE_SWAGGER_AUTH: JSON.parse(process.env.DISABLE_SWAGGER_AUTH ?? "true"),
  // URL of the data science server
  DATASCIENCE_BASE_URL: `http://${
    process.env.PYTHON_BACKEND_HOST ?? "localhost"
  }:${process.env.PYTHON_BACKEND_PORT ?? 50000}/api`,
  // firebase config
  FIREBASE_CONFIG: frontendEnvironment.firebase,
} as const;
