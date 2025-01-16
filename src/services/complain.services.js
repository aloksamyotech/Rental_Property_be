import Owner from "../models/owner.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Complaint from "../models/complaints.model.js";
import Tenant from "../models/tenant.model.js";
import Agent from "../models/agents.model.js";
import Company from "../models/company.model.js";

export const complainRegistration = async (req, res) => {

  const { tenantName,propertyId, companyId, tenantId, agentId, concernTopic, description } = req.body;

  const isComplainAlreadyExist = await Complaint.findOne({ concernTopic });

  if (isComplainAlreadyExist) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  const complain = await Complaint.create({
    tenantName,
    propertyId,
    companyId,
    tenantId,
    agentId,
    concernTopic,
    description,
  });

  return complain;
};

export const allComplain = async (req) => {
  const tenantId = req.query.id;
  if (!tenantId) {
    throw new CustomError(
      statusCodes.badRequest,
      Message.missingId,
      errorCodes.missing_id
    );
  }

  const allComplain = await Complaint.find({ tenantId, isDeleted: false }).sort({ createdAt: -1 });

  if (!allComplain) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.serverError,
      errorCodes?.conflict,
    );
  }
  return allComplain;
};



export const editComplain = async(req, res, next) => {
  const ComplaintId = req.query.id;
  const updateData = req.body; 
  const editComplain = await Complaint.findByIdAndUpdate(
    ComplaintId,
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
    return editComplain;
};

export const deleteComplain = async (req, res) => {
  const compalainId = req.query.id;

  const complain = await Complaint.findById(compalainId);
  if (!complain) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }

  complain.isDeleted = true;
  await complain.save();
  return complain;
};

export const resolveComplain = async (req, res) => {
  const compalainId = req.query.id;

  const complain = await Complaint.findById(compalainId);
  if (!complain) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }

  complain.status = true ;

  await complain.save();
  return complain;
};

export const addCommentToComplain = async (req, res) => {
  const compalainId = req.query.id;
  const {comment} = req.body;

  const complain = await Complaint.findById(compalainId);
  if (!complain) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }

  complain.comment = comment || complain.comment; 

  await complain.save();
  return complain;
};

export const fetchComplainById = async(req,res) =>{
   const complainId = req.query.id;
   if(!complainId){
    throw new CustomError(
      statusCodes.badRequest,
      Message.missingId,
      errorCodes.missing_id
    );
   }
   const complain = await Complaint.find({_id:complainId})
   .populate("tenantId")
   .populate("propertyId")
   .populate("companyId")
   .lean();
   if (!complain) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Complain not found",
      errorCodes?.not_found
    );
  }
  return complain;
}

export const allComplainForCompany = async (req, res) => {
  const companyId = req.query.id;
  if (!companyId) {
    throw new CustomError(
      statusCodes.badRequest,
      Message.missingId,
      errorCodes.missing_id
    );
  }

  const allComplain = await Complaint.find({ companyId, isDeleted: false })
    .populate("tenantId")
    .populate("propertyId", "propertyname")
    .sort({ createdAt: -1 })
    .lean();

  if (!allComplain || allComplain.length === 0) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.serverError,
      errorCodes?.conflict
    );
  }

  const finalResponse = [];

  for (let i = 0; i < allComplain.length; i++) {
    const complaint = allComplain[i];
    const tenant = complaint.tenantId;

    if (!tenant || !tenant.reporterId) {
      throw new CustomError(
        statusCodes?.badRequest,
        "ReporterId not found for tenant",
        errorCodes?.missing_reporter_id
      );
    }

    const createdBy = tenant.reporterId;
    let creator = await Agent.findById(createdBy);
    let name;

    if (creator) {
      name = creator.agentName; 
    } else {
      creator = await Company.findById(createdBy);
      if (creator) {
        name = creator.companyName; 
      }
    }

    if (!name) {
      throw new CustomError(
        statusCodes?.badRequest,
        "No valid creator found for reporterId",
        errorCodes?.invalid_reporter_id
      );
    }

    finalResponse.push({ ...complaint, reporterName: name });
  }

  return finalResponse;
};

