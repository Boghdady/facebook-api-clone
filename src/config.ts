import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

// Load env variables from .env file
dotenv.config({});

class Config {
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public PORT: string | undefined;
  public COOKIE_SECRET_KEY_ONE: string | undefined;
  public COOKIE_SECRET_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  public REDIS_HOST: string | undefined;
  public CLOUDINARY_NAME: string | undefined;
  public CLOUDINARY_API_KEY: string | undefined;
  public CLOUDINARY_API_SECRET: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public SENDGRID_API_KEY: string | undefined;

  private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/chatty-app';

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
    this.JWT_TOKEN = process.env.JWT_TOKEN || undefined;
    this.NODE_ENV = process.env.NODE_ENV || undefined;
    this.PORT = process.env.PORT || undefined;
    this.COOKIE_SECRET_KEY_ONE = process.env.COOKIE_SECRET_KEY_ONE || undefined;
    this.COOKIE_SECRET_KEY_TWO = process.env.COOKIE_SECRET_KEY_TWO || undefined;
    this.CLIENT_URL = process.env.CLIENT_URL || undefined;
    this.REDIS_HOST = process.env.REDIS_HOST || undefined;
    this.CLOUDINARY_NAME = process.env.CLOUDINARY_NAME || undefined;
    this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || undefined;
    this.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || undefined;
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || undefined;
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || undefined;
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || undefined;
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({
      name,
      level: 'debug'
    });
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUDINARY_NAME,
      api_key: this.CLOUDINARY_API_KEY,
      api_secret: this.CLOUDINARY_API_SECRET
    });
  }
}

export const config = new Config();
