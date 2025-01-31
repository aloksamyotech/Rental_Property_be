import mongoose from "mongoose";
import User from '../../models/user.model.js';
import { database_urls } from "../common/constant.js";
import "dotenv/config";

const connectDB = async () => {
  try {
    (async function () {
      const dbUri = database_urls.connection + database_urls.db_name;
      const connection = await mongoose.connect(dbUri, {});
      if (connection) {
        const existingAdmin = await User.findOne({
          email: "admin@samyotech.com",
        });
        if (!existingAdmin) {
          const userData = new User({
            name: "Samyotech",
            gender: "Male",
            phoneNumber: "1234567890",
            email: "admin@samyotech.com",
            password: "1234",
            role: "admin"
          });
          await userData.save();
          console.log(`New Admin is Created`);
        }
      }
    })()
  } catch (error) {
    console.error("database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
