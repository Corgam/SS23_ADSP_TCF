import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";

import config from './config/config';
import errorMiddleware from './middleware/error.middleware';
import { json, urlencoded } from 'body-parser';

/**
 * Tangible Climate Futures Server App
 */
class App {
    public express: Application;
    public port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;

        this.initializeDatabaseConnection();
        this.initializeMiddleware();
        this.generateRoutesAndInitializeSwagger();
        this.initializeErrorHandling();
    }

    // add middlewares
    private initializeMiddleware(): void {
        const { HOST, PORT } = config;

        // Cors (Cross-Origin Resource Sharing)
        const corsOptions = {
            origin: `http://${HOST}:${PORT}`,
        };
  
        // apply cors settings
        this.express.use(cors(corsOptions));
        // add logging
        this.express.use(morgan('dev'));
        // add compression
        this.express.use(compression());
        // add security
        this.express.use(helmet());

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

        // connect to database
        return mongoose.connect(MONGODB_URL)
            .then(() => {
                console.log("Connected to the database at: %s", MONGODB_URL);
            })
            .catch((error: Error) => {
                console.log("Cannot connect to the database at %s!", MONGODB_URL, error);
                // Terminate the container
                process.exit();
            });
    }

    private generateRoutesAndInitializeSwagger(): void {
        // register swagger route
        this.express.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
            return res.send(
            swaggerUi.generateHTML(await import("../build/swagger.json"))
            );
        });

        // register generated routes
        RegisterRoutes(this.express);
    }

    // initializing error middleware must happen after registering routes
    private initializeErrorHandling() {
        this.express.use(function notFoundHandler(req: Request, res: Response) {
            res.status(404).send({
              message: "Not Found",
            });
          });

        this.express.use(errorMiddleware);
    }

    // start express server
    public listen(): void {
        const { HOST, PORT } = config;

        this.express.listen(this.port, () => {
            console.log(`Running on http://${HOST}:${PORT}`);
            console.log(`Documention is running on http://${HOST}:${PORT}/docs`);
        });
    }
}

export default App;
