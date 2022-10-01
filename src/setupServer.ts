import http from "http";
import {Application, json, urlencoded, Response, Request, NextFunction} from "express";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import compression from "compression";
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import Logger from "bunyan";

import {config} from "./config";
import appRoutes from "./routes";
import {CustomError, IErrorResponse} from "./shared/globals/helpers/error-handler";

const SERVER_PORT = config.PORT || 5000;
const logger: Logger = config.createLogger("setupServer");

export class AppServer {
    private readonly app: Application;

    constructor(app: Application) {
    this.app = app;
    }

    public async start(): Promise<void> {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorHandler(this.app);
        await this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: "session",
                keys: [config.COOKIE_SECRET_KEY_ONE!, config.COOKIE_SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== "development"
            })
        );
        app.use(hpp());
        app.use(helmet())
        app.use(cors({
            origin: config.CLIENT_URL,
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

    private routeMiddleware(app: Application): void {
        appRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
        // Handle unhandled routes
        app.all("*", (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({message: `resource ${req.originalUrl} not found!`});
        });

        // Global error middleware
        app.use(( error: IErrorResponse, req: Request, res: Response, next: NextFunction ) => {
            logger.error(error);
            if( error instanceof CustomError) {
                res.status(error.statusCode).json(error.serializeError());
            }
            next();
        });
    }

    private async  startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIO: Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIO);
        } catch (e) {
            logger.error(e);
        }
    }

    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        // @doc: https://socket.io/docs/v4/redis-adapter/
        const io : Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            }
        });
        const pubClient = createClient({ url: config.REDIS_HOST });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        return io;
    }

    private socketIOConnections(io: Server): void {}

    private startHttpServer(httpServer: http.Server): void {
       logger.info(`Server has started with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            logger.info(`Server listening on port ${SERVER_PORT}`);
        });
    }
}
