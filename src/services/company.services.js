// import Owner from "../models/owner.model.js";
import Company from "../models/company.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Agent from "../models/agents.model.js";
import Tenant from "../models/tenant.model.js";

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
};const generateAccessAndRefreshTokens = async (userId) => {

  let user;
  let role = "";

  user = await Company.findById(userId);


  if (!user) {
      user = await Agent.findById(userId);
  }

  if (!user) {
      user = await Tenant.findById(userId);
  }

  if (!user) {
      throw new Error("User not found");
  }

  let accessToken = user.generateAccessToken();
  let refreshToken = user.generateRefreshToken();


  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });


  return { accessToken, refreshToken };
};



export const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let user = await Company.findOne({ email });
    let role = "companyAdmin";

    if (!user) {
      user = await Agent.findOne({ email });
      role = "agent";
    }

    if (!user) {
      user = await Tenant.findOne({ email });
      role = "tenant";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

 
    const passwordVerify = await user.isPasswordCorrect(password);
    if (!passwordVerify) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id 
    );

    if (!accessToken || !refreshToken) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while generating refresh and access tokens.",
      });
    }

    res.setHeader("token", accessToken);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return ({
    role: user.role,
    accessToken,
    refreshToken,
    options
    });
};


export const getAllCompany = async (req) => {
  const AllComp = await Company.find({isDeleted: false}).sort({ createdAt: -1 });

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

export const editCompany = async(req, res, next) => {
  const CompanyId = req.query.id;
  const updateData = req.body; 
  const editCompany = await Company.findByIdAndUpdate(
    CompanyId,
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

  return company
};