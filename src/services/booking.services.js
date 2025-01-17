// import Agent from "../models/agents.model.js";
import Booking from "../models/booking,model.js";
import Property from "../models/property.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Agent from "../models/agents.model.js";
import Company from "../models/company.model.js";
export const createBooking = async (req, res) => {
  const {
    tenantId,
    propertyId,
    startingDate,
    endingDate,
    rentAmount,
    advanceAmount,
    companyId,
    createdBy,
  } = req.body;

  const newBooking = await Booking.create({
    tenantId,
    propertyId,
    startingDate,
    endingDate,
    rentAmount,
    advanceAmount,
    companyId,
    createdBy,
  });

  return newBooking;
};

const generateBookingId = () => {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const timestampPart = Date.now();
  const bookingId = `BK-${timestampPart}-${randomPart}`;
  return bookingId;
};

export const editBooking = async (req, res, next) => {
  const { id } = req.query;
  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    {
      tenantId: req.body?.tenantId,
      propertyId: req.body?.propertyId,
      startingDate: req.body?.startingDate,
      endingDate: req.body?.endingDate,
      rentAmount: req.body?.rentAmount,
      advanceAmount: req.body?.advanceAmount,
      companyId: req.body?.companyId,
      createdBy: req.body?.createdBy,
    },
    {
      new: true,
    }
  );
  if (!updatedBooking) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable
    );
  }
  return updatedBooking;
};

export const getBooking = async (req) => {
  const { id } = req.query;

  const AllBooking = await Booking.find({ createdBy: id })
  .populate("tenantId", "tenantName")
  .populate("propertyId", "propertyname")
  .sort({ createdAt: -1 })
  .lean();

  if (!AllBooking) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  const finalResponse = [];
  for (const booking of AllBooking) {
    const createdBy = booking.createdBy;

    let creater = await Agent.findById(createdBy);
    let name;
    if (creater) {
      name = creater.agentName;
    } else {
      creater = await Company.findById(createdBy);
      if (creater) {
        name = creater.companyName;
      }
    }
    finalResponse.push({ name, ...booking });
  }
  return finalResponse;
};

export const getBookingById = async(req) =>{
  const {id} = req.query;
  const booking = await Booking.findById(id)
  .populate("tenantId")
  .populate("propertyId")
  .populate("companyId")
  .sort({ createdAt: -1 })
  .lean();
 
  if (!booking || booking.length === 0) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return booking
}

export const getAllBooking = async (req) => {
  const { id } = req.query;

  // Fetch bookings
  const allBooking = await Booking.find({ companyId: id })
    .populate("tenantId")
    .populate("propertyId")
    .sort({ createdAt: -1 })
    .lean();

  if (!allBooking || allBooking.length === 0) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.noDataFound,
      errorCodes?.no_data_found
    );
  }

  const finalResponse = [];
  for (const booking of allBooking) {
    const createdBy = booking.createdBy;

    let creater = await Agent.findById(createdBy);
    let name;
    if (creater) {
      name = creater.agentName;
    } else {
      creater = await Company.findById(createdBy);
      if (creater) {
        name = creater.companyName;
      }
    }
    finalResponse.push({ name, ...booking });
  }
  return finalResponse;
};
