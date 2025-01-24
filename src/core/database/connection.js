import mongoose from "mongoose";
import { database_urls } from "../common/constant.js";
import "dotenv/config";

const connectDB = async () => {
  try {
    (async function () {
      const dbUri = database_urls.connection + database_urls.db_name;
      console.log(dbUri,
        "dburi"
      )
      await mongoose.connect(dbUri, {
        //   useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
    })();
  } catch (error) {
    console.error("database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
