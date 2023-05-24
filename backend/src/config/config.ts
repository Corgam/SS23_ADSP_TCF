export default {
  // URL of the MongoDB database to connect to.
  // With Docker, the name of the container can also be provided instead of the IP address.
  // Here: mongodb://<IP>:<PORT>/<COLLECTION_NAME>
  MONGODB_URL: process.env.MONGODB_URL ?? "mongodb://localhost:27017/datastore",
  // Port of the express server
  PORT: +(process.env.PORT ?? 8080),
  // IP of the express server
  HOST: process.env.HOST ?? "localhost",
} as const;
