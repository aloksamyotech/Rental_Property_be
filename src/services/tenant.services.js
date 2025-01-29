
import Tenant from "../models/tenant.model.js";
import { errorCodes, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import { Message } from "../core/common/constant.js";
import Booking from "../models/booking,model.js";
import Agent from "../models/agents.model.js";
import Company from "../models/company.model.js";


export const createTenant = async (req) => {

  const { 
    tenantName,
    email,
    password,
    phoneno,
    identityCardType,
    identityNo,
    identityImage,
    emergencyNo,
    address,
    reporterId,
    companyId
  } = req.body;

  const isTenantAlreadyExist = await Tenant.findOne({ email });

  if (isTenantAlreadyExist) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  const tenant = await Tenant.create({
    tenantName,
    email,
    password,
    phoneno,
    identityCardType,
    identityNo,
    identityImage,
    emergencyNo,
    address,
    reporterId,
    companyId
  });

  const createdTenant = await Tenant.findById(tenant._id).select(
    "-password -refreshToken"
  );

  if (!createdTenant) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable
    );
  }

  return createdTenant;
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const tenant = await Tenant.findById(userId);
    const accessToken = tenant.generateAccessToken();
    const refreshToken = tenant.generateRefreshToken();

    tenant.refreshToken = refreshToken;
    await tenant.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new CustomError(
      statusCodes?.internalServerError,
      "Something went wrong while generating refresh and access tokens.",
      errorCodes?.server_error
    );
  }
};

export const loginTenant = async (req, res) => {
  const { email, password } = req.body;

  const tenant = await Tenant.findOne({ email });
  if (!tenant) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.not_found
    );
  }

  const passwordVerify = await tenant.isPasswordCorrect(password);

  if (!passwordVerify) {
    throw new CustomError(
      statusCodes?.badRequest,
      Message?.inValid,
      errorCodes?.invalid_credentials
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    tenant._id
  );

  const loginTenant = await Tenant.findById(tenant._id).select(
    "-password -refreshToken"
  );

  res.setHeader("token", accessToken);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return {
    accessToken,
    refreshToken,
    options,
    loginTenant
  };
};

// export const getTenants = async (req, res, next) => {

//     const companyId = req.query.id;

//     const tenants = await Tenant.find({ companyId, isDeleted: false }).sort({ createdAt: -1 });

//     if (!tenants || tenants.length === 0) {
//       return next(
//         new CustomError(
//           statusCodes?.notFound,
//           Message?.notFound || 'No tenants found',
//           errorCodes?.not_found
//         )
//       );
//     }
//     return tenants
// };

export const getTenants = async (req, res, next) => {
    const { id: companyId } = req.query;

    const tenants = await Tenant.find({
      companyId,
      isOccupied: false,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    if (!tenants || tenants.length === 0) {
      throw new CustomError(
        statusCodes?.notFound,
        Message?.notFound || 'No tenants found',
        errorCodes?.not_found
      );
    }

    return tenants;
};


export const mybooking = async (req, res, next) => {

  const Id = req.query.id;

  const tenantBooking = await Booking.find({ tenantId: Id, isDeleted: false })
  .populate("tenantId", "tenantName")
  .populate("propertyId", "propertyname")
  .sort({ createdAt: -1 })
  .lean();

  if (!tenantBooking || tenantBooking.length === 0) {
    throw new CustomError(
      statusCodes?.badRequest,
      "Tenant ID is required.",
      errorCodes?.missing_parameter
    );
  }

  const finalResponse = [];
  for (const booking of tenantBooking) {

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


export const editTenant = async (req, res) => {
    const  tenantId  = req.query.id; 
    const updateData = req.body; 

    if (!tenantId) {
      throw new CustomError(
        statusCodes?.badRequest,
        "Tenant ID is required.",
        errorCodes?.missing_parameter
      );
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      updateData,
      { new: true, runValidators: true } 
    ).select("-password -refreshToken"); 

    if (!updatedTenant) {
      throw new CustomError(
        statusCodes?.notFound,
        "Tenant not found.",
        errorCodes?.not_found
      );
    }
    return updatedTenant;
};

export const deleteTenantById = async (req, res) => {
    const tenantId = req.query.id;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new CustomError(
        statusCodes?.notFound,
        Message?.notFound || "Tenant not found",
        errorCodes?.not_found
      );
    }

    tenant.isDeleted = true;
    await tenant.save();

    return tenant
};


export const getTenantsById = async (req, res, next) => {
    const { id } = req.query;

    if (!id) {
      throw new CustomError(
        statusCodes?.badRequest,
        "Tenant ID is required",
        errorCodes?.invalid_request
      );
    }
 const tenant = await Tenant.findById(id);

    if (!tenant) {
      throw new CustomError(
        statusCodes?.notFound,
        Message?.notFound || "No tenant found",
        errorCodes?.not_found
      );
    }

  const bookings = await Booking.find({ tenantId:id })
  .populate("propertyId");

  const formattedBookings = bookings.map((bookingData) => ({
    propertyName: bookingData.propertyId?.propertyname , 
    description: bookingData.propertyId?.description,
    rent: bookingData.propertyId?.rent,
    address: bookingData.propertyId.address
  }));
    return {
      tenant, 
      booking : formattedBookings
    };
};

export const getAllTenants = async (req, res, next) => {
  const { id: companyId } = req.query;

  const tenants = await Tenant.find({
    companyId,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  if (!tenants || tenants.length === 0) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || 'No tenants found',
      errorCodes?.not_found
    );
  }

  return tenants;
};



export const getMyTenants = async (req, res) => {
  const id = req.query.id;
  const tenant = await Tenant.find({reporterId:id ,isDeleted: false}).sort({ createdAt: -1 });
  if (!tenant) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }
  return tenant;
};
