// import Agent from "../models/agents.model.js";
import Booking from "../models/booking,model.js";
import Property from "../models/property.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Agent from "../models/agents.model.js";
import Company from "../models/company.model.js";
import Tenant from "../models/tenant.model.js";
import Bill from "../models/billing.model.js";


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
    createdBy
  });
  const property = await Property.findById(propertyId);
  property.isVacant = false;
  await property.save();

  const tenant = await Tenant.findById(tenantId);
  tenant.isOccupied = true;
  await tenant.save();


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

  const AllBooking = await Booking.find({ createdBy: id , isDeleted: false})
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
 
  if (!booking ) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return booking
}


export const breakTheBooking = async (req) => {
  const { id } = req.query;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  booking.isDeleted = true;
  booking.save();

  const tenant = await Tenant.findById(booking.tenantId);
  if (!tenant) {
    throw new CustomError(
      statusCodes?.notFound,
      "Tenant not found",
      errorCodes?.no_data_found
    );
  }

  tenant.isOccupied = false;
  await tenant.save();

  const property = await Property.findById(booking.propertyId);
  if (!property) {
    throw new CustomError(
      statusCodes?.notFound,
      "Property not found",
      errorCodes?.no_data_found
    );
  }

  property.isVacant = true;
  await property.save();

  return booking;
};




export const getAllBooking = async (req) => {
  const { id } = req.query;

  const allBooking = await Booking.find({ companyId: id , isDeleted: false})
    .populate("tenantId")
    .populate("propertyId")
    .sort({ createdAt: -1 })
    .lean();

  if (!allBooking) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
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


export const vacantPropertyOnNotice = async (req, res) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const after15Days = new Date();
    after15Days.setDate(today.getDate() + 15);
    after15Days.setHours(23, 59, 59, 999); 

    const bookings = await Booking.find({
      endingDate: {
        $gte: today, 
        $lte: after15Days,
      },
      isDeleted: false, 
    }).populate("propertyId tenantId companyId"); 
  
    return bookings;
 
};
