import Agent from "../models/agents.model.js";
import Property from "../models/property.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Booking from "../models/booking,model.js";
import Tenant from "../models/tenant.model.js";

export const createAgent = async (req, res) => {


const { agentName, email, password, phoneNo, address, companyId } = req.body;


    const isAgentAlreadyExist = await Agent.findOne({ email });

    if (isAgentAlreadyExist) {
      throw new CustomError(
        statusCodes?.conflict,
        Message?.alreadyExist,
        errorCodes?.already_exist,
      );
    }

    const newAgent = await Agent.create({
      agentName,
      email,
      password,
      phoneNo,
      address,
      companyId: companyId,
    });

    return res.status(201).json({
      success: true,
      message: "Agent created successfully!",
      data: newAgent,
    });
};


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const agent = await Agent.findById(userId);
    const accessToken = agent.generateAccessToken();
    const refreshToken = agent.generateRefreshToken();

    agent.refreshToken = refreshToken;
    await agent.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new CustomError(
      statusCodes?.internalServerError,
      "Something went wrong while generating refresh and access tokens.",
      errorCodes?.server_error
    );
  }
};

export const loginAgent = async (req, res) => {
  const { email, password } = req.body;

  const agent = await Agent.findOne({ email });


  if (!agent) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.not_found
    );
  }

  const passwordVerify = await agent.isPasswordCorrect(password);

  if (!passwordVerify) {
    throw new CustomError(
      statusCodes?.badRequest,
      Message?.inValid,
      errorCodes?.invalid_credentials
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    agent._id
  );

  const loginAgent = await Agent.findById(agent._id).select(
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
    loginAgent
  };
};

export const editAgent = async(req, res, next) => {
  const agentId = req.query.id;
  const updateData = req.body; 
  const editAgent = await Agent.findByIdAndUpdate(
    agentId,
    updateData,
    { new: true, runValidators: true } 
  )
  if (!editAgent) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
    return editAgent;
};

export const getAllAgent = async (req) => {
  const companyId = req.query.id;
  if (!companyId) {
    throw new CustomError(
      statusCodes.badRequest,
      Message.missingId,
      errorCodes.missing_id
    );
  }
  const allAgent = await Agent.find({companyId:companyId, isDeleted: false}).sort({ createdAt: -1 }); 

  if (!allAgent) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.serverError,
      errorCodes?.conflict,
    );
  }
  return allAgent;
};


export const deleteAgent = async (req, res) => {
  const agentId = req.query.id;

  const agent = await Agent.findById(agentId);
  if (!agent) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }

  agent.isDeleted = true;
  await agent.save();

  return agent
};

export const getAgentById = async (req, res) => {

    const agentId = req.query.id;
    const agent = await Agent.findById(agentId);

    if (!agent) {
      throw new CustomError(
        statusCodes?.notFound,
        Message?.notFound || "Agent not found",
        errorCodes?.not_found
      );
    }

    const bookings = await Booking.find({ createdBy: agentId })
      .populate("propertyId")
      .populate("tenantId");

  //   const formattedBookings = bookings.map((bookingData) => ({
  //     propertyName: bookingData.propertyId?.propertyname,
  //     description: bookingData.propertyId?.description,
  //     rent: bookingData.propertyId?.rent,
  //     address: bookingData.propertyId?.address
  // }));

  const  tenant = await Tenant.find({reporterId:agentId});

  return {
    agent,
    bookings,
    // booking: formattedBookings,
    tenant
  }

}


