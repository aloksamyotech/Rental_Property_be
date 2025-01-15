import Owner from "../models/owner.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import Complaint from "../models/complaints.model.js";

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
