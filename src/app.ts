import express ,{ Express } from "express";
import {AppServer} from "./setupServer";

class Application {
    public initialize(): void {
        const app: Express = express();
        const server = new AppServer(app);
        server.start();
    }
}

const app: Application = new Application();
app.initialize();

