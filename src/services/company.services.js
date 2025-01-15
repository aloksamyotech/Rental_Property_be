// import Owner from "../models/owner.model.js";
import Company from "../models/company.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Agent from "../models/agents.model.js";
import Tenant from "../models/tenant.model.js";
import Complaint from "../models/complaints.model.js";

export const companyRegistration = async (req) => {
  const { companyName, email, password, phoneNo, address } = req.body;
  const isCompanyAlreadyExist = await Company.findOne({ email });

  // const Role =  req.user.role;

  // if(!(Role == "admin")){
  //   throw new CustomError(
  //     statusCodes?.conflict,
  //     Message?.alreadyExist,
  //     errorCodes?.already_exist
  //   );
  // }

  if (isCompanyAlreadyExist) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  const company = await Company.create({
    companyName,
    email,
    password,
    phoneNo,
    address,
  });

  const createdCompany = await Company.findById(company._id).select(
    "-password -refreshToken"
  );

  if (!createdCompany) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable
    );
  }
  return createdCompany;
};

// export const companyLogin = async (req, res) => {
//   const { email, password } = req.body;

//   const company = await Company.findOne({ email });
//   if (!company) {
//     throw new CustomError(
//       statusCodes?.notFound,
//       Message?.notFound,
//       errorCodes?.not_found
//     );
//   }

//   const passwordVerify = await company.isPasswordCorrect(password);

//   if (!passwordVerify) {
//     throw new CustomError(
//       statusCodes?.badRequest,
//       Message?.inValid,
//       errorCodes?.invalid_credentials
//     );
//   }

//   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
//     company._id
//   );

//   const loginCompany = await Company.findById(company._id).select(
//     "-password -refreshToken"
//   );

//   res.setHeader("token", accessToken);

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   return {
//     company,
//     role: company.role,
//     accessToken,
//     refreshToken,
//     options,
//     loginCompany
//   };
// };

export const universalLogin = async (req, res) => {
  const { email, password } = req.body;

  let user = null;

  const company = await Company.findOne({ email });
  const agent = await Agent.findOne({ email });
  const tenant = await Tenant.findOne({ email });

  if (company) {
    user = company;
  } else if (agent) {
    user = agent;
  } else if (tenant) {
    user = tenant;
  }

  if (!user) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.not_found
    );
  }

  const passwordVerify = await user.isPasswordCorrect(password);
  if (!passwordVerify) {
    throw new CustomError(
      statusCodes?.badRequest,
      Message?.inValid,
      errorCodes?.invalid_credentials
    );
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await user.constructor
    .findById(user._id)
    .select("-password -refreshToken");

  res.setHeader("token", accessToken);

  const options = {
    httpOnly: true,
    secure: true, // Use true in production
  };

  // Return the response
  return res.status(200).json({
    user: loggedInUser,
    role: user.role,
    accessToken,
    refreshToken,
    options,
  });
};

const generateAccessAndRefreshTokens = async (userId) => {
  const company = await Company.findById(userId);
  const agent = await Agent.findById(userId);
  const tenant = await Tenant.findById(userId);

  let user;
  let userType;

  if (company) {
    user = company;
    userType = "company";
  } else if (agent) {
    user = agent;
    userType = "agent";
  } else if (tenant) {
    user = tenant;
    userType = "tenant";
  } else {
    throw new CustomError(
      statusCodes?.notFound,
      "User not found in any collection.",
      errorCodes?.user_not_found
    );
  }

  let accessToken, refreshToken;
  if (userType === "company") {
    accessToken = company.generateAccessToken();
    refreshToken = company.generateRefreshToken();
    user.refreshToken = refreshToken;
  } else if (userType === "agent") {
    accessToken = agent.generateAccessToken();
    refreshToken = agent.generateRefreshToken();
    user.refreshToken = refreshToken;
  } else if (userType === "tenant") {
    accessToken = tenant.generateAccessToken();
    refreshToken = tenant.generateRefreshToken();
    user.refreshToken = refreshToken;
  }

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// const generateAccessAndRefreshTokens = async (userId) => {
//   try {
//     const company = await Company.findById(userId);
//     const accessToken = company.generateAccessToken();
//     const refreshToken = company.generateRefreshToken();

//     company.refreshToken = refreshToken;
//     await company.save({ validateBeforeSave: false });
//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new CustomError(
//       statusCodes?.internalServerError,
//       "Something went wrong while generating refresh and access tokens.",
//       errorCodes?.server_error
//     );
//   }
// };

export const getAllCompany = async (req) => {
  const AllComp = await Company.find({ isDeleted: false }).sort({
    createdAt: -1,
  });

  if (!AllComp) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  // const Role =  req.user.role;

  // if(!(Role == "admin")){
  //   throw new CustomError(
  //     statusCodes?.conflict,
  //     Message?.alreadyExist,
  //     errorCodes?.already_exist
  //   );
  // }
  return AllComp;
};

export const editCompany = async (req, res, next) => {
  const CompanyId = req.query.id;
  const updateData = req.body;
  const editCompany = await Company.findByIdAndUpdate(CompanyId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updateData) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable
    );
  }
  return editCompany;
};

export const deleteCompany = async (req, res) => {
  const companyId = req.query.id;

  const company = await Company.findById(companyId);
  if (!company) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Company not found",
      errorCodes?.not_found
    );
  }

  company.isDeleted = true;
  await company.save();

  return company;
};

export const commentAndResolved = async (req, res) => {
  const companyId = req.query.id;
  if (!companyId) {
    throw new CustomError(
      statusCodes.badRequest,
      Message.missingId,
      errorCodes.missing_id
    );
  }

  const allComplain = await Complaint.find({ companyId, isDeleted: false })
    .populate("tenantId", "tenantName")
    .populate("propertyId", "propertyname")
    .sort({ createdAt: -1 })
    .lean();



  if (!allComplain) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.serverError,
      errorCodes?.conflict
    );
  }
  return allComplain;
};
