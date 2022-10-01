import express, { Express } from 'express';
import { AppServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application {
  public async initialize(): Promise<void> {
    this.loadConfig();
    databaseConnection();

    const app: Express = express();
    const server = new AppServer(app);
    await server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

const app: Application = new Application();
app.initialize();
