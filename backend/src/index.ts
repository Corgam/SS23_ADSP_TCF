import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import { Request, Response } from "express";

import config from "./config/config";
import App from "./app";

// create server app
const app = new App(config.PORT);

// register swagger route
app.express.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
    return res.send(
      swaggerUi.generateHTML(await import("../build/swagger.json"))
    );
  });

// register generated routes
RegisterRoutes(app.express);

// start server
app.listen();
