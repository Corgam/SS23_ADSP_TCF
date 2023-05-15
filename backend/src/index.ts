import config from "./config/config";
import App from "./app";


// create server app
const app = new App(config.PORT);

// start server
app.listen();
