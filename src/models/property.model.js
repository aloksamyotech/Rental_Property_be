import mongoose, { Schema } from "mongoose";


const propertySchema = new Schema(
  {
    propertyname: {
      type: String
    },
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type"
    },
    description:{
      type: String
    },
    files: {
        type: [String] 
      },
    address: {
      type: String
    },
    zipcode: {
      type: String
    },
    maplink: {
      type: String
    },
    rent:{
      type: String
    },
    isDeleted: {
      type: String,
      default: false
    },
    ownerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner"
    },
    companyId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },
    isVacant:{
      type: Boolean,
      default: true
    },
  },
  { timestamps: true },
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
