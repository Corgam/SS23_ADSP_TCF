import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import config from './config/config';

class App {
    public express: Application;
    public port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;

        this.initializeDatabaseConnection();
        this.initializeMiddleware();
    }

    private initializeMiddleware(): void {
        const { HOST, PORT } = config;

        // Cors (Cross-Origin Resource Sharing)
        const corsOptions = {
            origin: `http://${HOST}:${PORT}`,
        };
  
        this.express.use(cors(corsOptions));
        this.express.use(morgan('dev'));
        this.express.use(compression());
        this.express.use(helmet());
    }

    private initializeDatabaseConnection(): Promise<void> {
        const { MONGODB_URL } = config;

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

    public listen(): void {
        const { HOST, PORT } = config;

        this.express.listen(this.port, () => {
            console.log(`Running on http://${HOST}:${PORT}`);
        });
    }
}

export default App;