import mongoose, { Schema } from "mongoose";


const bookingSchema = new Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    },
    tanentId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant"
    },
    bookingDate: {
      type: Date, 
      default: Date.now,
    },
    statingDate: {
      type: Date, 
    },
    rentAmount:{
      type: Number,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId
    },
    vacantNotice:{
      type: Boolean,
      default: true
    }
  },
  { timestamps: true },
);

const Booking = mongoose.model("Property", bookingSchema);

export default Booking;
