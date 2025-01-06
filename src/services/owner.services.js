import Owner from "../models/owner.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Company from "../models/company.model.js";

export const registerOwner = async (req, res) => {
  console.log(`req`, req.body);

  const { ownerName, email, password, phoneNo, address, companyId } = req.body;

  const isOwnerAlreadyExist = await Owner.findOne({ email });

  if (isOwnerAlreadyExist) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  const owner = await Owner.create({
    ownerName,
    email,
    password,
    phoneNo,
    address,
    companyId: companyId,
  });

  const createdOwner = await Owner.findById(owner._id).select(
    "-password -refreshToken"
  );

  if (!createdOwner) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable
    );
  }
  return createdOwner;
};

export const getAllOwner = async (req) => {
  const companyId = req.query.id;
  if (!companyId) {
    throw new CustomError(
      statusCodes.badRequest,
      Message.missingId,
      errorCodes.missing_id
    );
  }

  const allOwner = await Owner.find({ companyId, isDeleted: false }).sort({ createdAt: -1 });

  if (!allOwner) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.serverError,
      errorCodes?.conflict,
    );
  }
  return allOwner;
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const owner = await Owner.findById(userId);
    const accessToken = owner.generateAccessToken();
    const refreshToken = owner.generateRefreshToken();

    owner.refreshToken = refreshToken;
    await owner.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new CustomError(
      statusCodes?.internalServerError,
      "Something went wrong while generating refresh and access tokens.",
      errorCodes?.server_error
    );
  }
};

export const loginOwner = async (req, res) => {
  const { email, password } = req.body;

  const owner = await Owner.findOne({ email });
  if (!owner) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.not_found
    );
  }

  const passwordVerify = await owner.isPasswordCorrect(password);

  if (!passwordVerify) {
    throw new CustomError(
      statusCodes?.badRequest,
      Message?.inValid,
      errorCodes?.invalid_credentials
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    owner._id
  );

  const loginOwner = await Owner.findById(owner._id).select(
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
    loginOwner,
  };
};


export const editOwner = async(req, res, next) => {
  const OwnerId = req.query.id;
  const updateData = req.body; 
  const editOwner = await Owner.findByIdAndUpdate(
    OwnerId,
    updateData,
    { new: true, runValidators: true } 
  ) 

  if (!updateData) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
    return editOwner;
};

export const deleteOwner = async (req, res) => {
  const ownerId = req.query.id;

  const owner = await Owner.findById(ownerId);
  if (!owner) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }

  owner.isDeleted = true;
  await owner.save();
  return owner
};
