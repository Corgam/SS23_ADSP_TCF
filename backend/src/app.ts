import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import config from './config/config';

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

    // start express server
    public listen(): void {
        const { HOST, PORT } = config;

        this.express.listen(this.port, () => {
            console.log(`Running on http://${HOST}:${PORT}`);
        });
    }
}

export default App;