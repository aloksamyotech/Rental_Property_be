
import Tenant from "../models/tenant.model.js";
import { errorCodes, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import { Message } from "../core/common/constant.js";


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
export const getTenants = async (req, res, next) => {
  try {
    const companyId = req.query.id;

    const tenants = await Tenant.find({ companyId, isDeleted: false }).sort({ createdAt: -1 });

    if (!tenants || tenants.length === 0) {
      return next(
        new CustomError(
          statusCodes?.notFound,
          Message?.notFound || 'No tenants found',
          errorCodes?.not_found
        )
      );
    }

    console.log('Active tenants:', tenants);

    // Return the list of tenants
    return res.status(statusCodes?.success || 200).json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return next(
      new CustomError(
        statusCodes?.serviceUnavailable,
        Message?.serverError || 'Service unavailable',
        errorCodes?.service_unavailable
      )
    );
  }
};


export const editTenant = async (req, res) => {
  console.log(req.query.id,"req.queryreq.queryreq.query");
    const  tenantId  = req.query.id; 
    const updateData = req.body; 

    console.log(tenantId, "tenantId");

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

    // Send successful response
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

