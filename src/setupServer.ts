import http from "http";
import {Application, json, urlencoded, Response, Request, NextFunction} from "express";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import compression from "compression";
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";

const SERVER_PORT  = process.env.PORT || 5000;

export class AppServer {
    private readonly app: Application;

    constructor(app: Application) {
    this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: "session",
                keys: ["test1", "test2"],
                maxAge: 24 * 7 * 3600000,
                secure: false
            })
        );
        app.use(hpp());
        app.use(helmet())
        app.use(cors({
            origin: "*",
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        }));
    }

    private  standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({ limit: "50mb" }));
        app.use(urlencoded({ extended: true, limit: "50mb" }));
    }

    private routeMiddleware(app: Application): void {}

    private globalErrorHandler(app: Application): void{}

    private  startServer(app: Application): void {
        try {
            const httpServer: http.Server = new http.Server(app);
            this.startHttpServer(httpServer);
        } catch (e) {
            console.log(e);
        }
    }

    private createSocketIO(httpServer: http.Server): void{}

    private startHttpServer(httpServer: http.Server): void{
        httpServer.listen(SERVER_PORT, () => {
            console.log(`Server listening on port ${SERVER_PORT}`);
        });
    }
}
