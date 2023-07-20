import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";

import config from "./config/config";
import errorMiddleware from "./middlewares/error.middleware";
import { json, urlencoded } from "body-parser";

/**
 * Tangible Climate Futures Server App
 */
class App {
  public readonly express: Application;

  constructor() {
    this.express = express();

    this.initializeMiddleware();
    this.generateRoutesAndInitializeSwagger();
    this.initializeErrorHandling();
  }

  /**
   * Initializes the middleware for the Express app.
   */
  private initializeMiddleware(): void {
    // Cors (Cross-Origin Resource Sharing)
    const corsOptions = {
      origin: "*",
    };

    this.express.use(cors(corsOptions)); // Apply CORS settings
    this.express.use(morgan("dev")); // Add logging
    this.express.use(compression()); // Add compression
    this.express.use(helmet()); // Add security

    this.express.use(
      urlencoded({
        extended: true,
      })
    );

    this.express.use(json());
  }

  // initialize Database Connection
  private initializeDatabaseConnection(): Promise<void> {
    const { MONGODB_URL } = config;

    // register disconnect when exiting the app
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Disconnect to the database");
      process.exit(0);
    });

    // connect to database
    return mongoose
      .connect(MONGODB_URL)
      .then(() => {
        console.log("Connected to the database at: %s", MONGODB_URL);
      })
      .catch((error: Error) => {
        console.log(
          "Cannot connect to the database at %s!",
          MONGODB_URL,
          error
        );
        // Terminate the container
        process.exit();
      });
  }

  // Generates routes and initializes Swagger documentation.
  private generateRoutesAndInitializeSwagger(): void {
    // register swagger route
    this.express.use(
      "/docs",
      swaggerUi.serve,
      async (_req: Request, res: Response) => {
        return res.send(
          swaggerUi.generateHTML(await import("../build/swagger.json"))
        );
      }
    );

    // register route for health check
    this.express.use("/health", async (_req: Request, res: Response) => {
      return res.status(200).json({
        status: "healthy",
      });
    });

    // register generated routes
    RegisterRoutes(this.express);
  }

  /**
   * Initializes error handling middleware.
   * Must be called after registering routes.
   */
  private initializeErrorHandling() {
    this.express.use(errorMiddleware);
  }

  // start express server
  private async listen(): Promise<void> {
    const { HOST, PORT, DISABLE_SWAGGER_AUTH } = config;

    return new Promise((resolve) =>
      this.express.listen(PORT, () => {
        console.log(`Api is running on http://${HOST}:${PORT}/api`);
        console.log(`Documention is running on http://${HOST}:${PORT}/docs`);
        console.log(`Health check is running on http://${HOST}:${PORT}/health`);
        if (DISABLE_SWAGGER_AUTH) {
          console.warn("Swagger authentication is disabled!");
        }

        resolve();
      })
    );
  }

  // start the application
  public async start(): Promise<void> {
    await this.initializeDatabaseConnection();
    await this.listen();
  }
}

export default App;
