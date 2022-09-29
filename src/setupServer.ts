import http from "http";
import {Application, json, urlencoded, Response, Request, NextFunction} from "express";

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

    private securityMiddleware(app: Application): void {}

    private  standardMiddleware(app: Application): void {}

    private routeMiddleware(app: Application): void {}

    private globalErrorHandler(app: Application): void{}

    private startServer(app: Application): void{}

    private createSocketIO(httpServer: http.Server): void{}

    private startHttpServer(httpServer: http.Server): void{}
}
