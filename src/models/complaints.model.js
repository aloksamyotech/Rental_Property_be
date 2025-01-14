import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const complaintSchema = new Schema(
  {
    tenantName: {
      type: String,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant"
    },
    AgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },
    concernTopic:{
      type: String,
    },
    description:{
      type: String
    }
  },
  { timestamps: true },
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;

