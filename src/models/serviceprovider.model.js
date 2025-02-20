import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const serviceProviderSchema = new Schema(
  {
    name : {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    workType: {
      type: String,
    },
    address: {
      type: String,
    },
    companyId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Company"
       },
       isDeleted: {
        type: Boolean,
        default: false
      },
  },
  { timestamps: true }
);


const ServiceProvider = mongoose.model("ServiceProvider", serviceProviderSchema);

export default ServiceProvider;
