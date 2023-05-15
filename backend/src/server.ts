import appendRoutes from "./routes/datafiles.routes";
import config from "./config/config";
import App from "./app";

const app = new App(config.PORT);
// Append other routes
appendRoutes(app.express);

app.listen();
