import dotenv from "dotenv";

// Load env variables from .env file
dotenv.config({});

class Config {
    public DATABASE_URL : string | undefined;
    public JWT_TOKEN : string | undefined;
    public NODE_ENV : string | undefined;
    public PORT : string | undefined;
    public COOKIE_SECRET_KEY_ONE : string | undefined;
    public COOKIE_SECRET_KEY_TWO : string | undefined;
    public CLIENT_URL : string | undefined;
    public REDIS_HOST : string | undefined;

    private readonly DEFAULT_DATABASE_URL = "mongodb://localhost:27017/chatty-app";

    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        this.JWT_TOKEN = process.env.JWT_TOKEN || undefined;
        this.NODE_ENV = process.env.NODE_ENV || undefined;
        this.PORT = process.env.PORT || undefined;
        this.COOKIE_SECRET_KEY_ONE = process.env.COOKIE_SECRET_KEY_ONE || undefined;
        this.COOKIE_SECRET_KEY_TWO = process.env.COOKIE_SECRET_KEY_TWO || undefined;
        this.CLIENT_URL = process.env.CLIENT_URL || undefined;
        this.REDIS_HOST = process.env.REDIS_HOST || undefined;
    }

    public validateConfig(): void {
        for( const [key, value] of Object.entries(this)) {
            if(value === undefined) {
                throw new Error(`Configuration ${key} is undefined`);
            }
        }
    }
}

export const config = new Config();
