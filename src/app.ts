import express, { Express } from 'express';
import { AppServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';

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
