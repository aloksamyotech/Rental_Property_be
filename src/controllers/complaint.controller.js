// import * as compa from "../services/owner.services.js";
// import * as companyServices from "../services/company.services.js";
import * as complainServices from "../services/complain.services.js";
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";

export const complainRegistration = async (req, res) => {
  const complainData = await complainServices.complainRegistration(req, res);
  res.status(statusCodes?.created).send(complainData);
};

export const allComplain = async (req, res) => {
  const complainData = await complainServices.allComplain(req, res);
  res.status(statusCodes?.created).send(complainData);
};

export const editComplain = async (req, res) => {
  const complainData = await complainServices.editComplain(req, res);
  res.status(statusCodes?.created).send(complainData);
};

export const deleteComplain = async (req, res) => {
  const complainData = await complainServices.deleteComplain(req, res);
  res.status(statusCodes?.created).send(complainData);
};



