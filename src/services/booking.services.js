// import Agent from "../models/agents.model.js";
import Booking from "../models/booking,model.js";
import Property from "../models/property.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";

export const createBooking = async (req, res) => {
    const { 
      propertyId,
      tanentId,
      statingDate,
      rentAmount
    } = req.body;

    const newBooking = await Booking.create({
      bookingId: generateBookingId(), 
      propertyId, 
      tanentId, 
      bookingDate: new Date(),
      statingDate,
      rentAmount,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "booking done successfully!",
      data: newBooking,
    });
};

const generateBookingId = () => {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const timestampPart = Date.now();
  const bookingId = `BK-${timestampPart}-${randomPart}`;
  return bookingId;
};


export const editAgent = async(req, res, next) => {
  const { id } = req.params;
  const updateAgent = await Agent.findByIdAndUpdate(
    id,
  {
    title:req.body?.title,
    agentname:req.body?.agentname,
    email:req.body?.email,
    password:req.body?.password,
    phoneno:req.body?.phoneno,
    identityNo:req.body?.identityNo,
    identityImage:req.body?.identityImage,
    address:req.body?.address
  },
  {
    new : true
  });
  if (!updateAgent) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
    return updateAgent;
};