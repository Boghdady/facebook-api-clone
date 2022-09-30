import  mongoose from "mongoose";
import { config } from "./config";

export default () => {
    const connect = () => {
        mongoose.connect(config.DATABASE_URL!)
            .then(() => {
                console.log("Successfully connected to database");
            })
            .catch(err => {
                console.log(`Database connection error: ${err}`);
                process.exit(1);
            });
    }

    connect();
    // If db connection fails, try to connect again
    mongoose.connection.on("disconnect", connect);
}
