// import * as compa from "../services/owner.services.js";
// import * as companyServices from "../services/company.services.js";
import * as complainServices from "../services/complain.services.js";
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";

export const complainRegistration = async (req, res) => {
  const companyData = await complainServices.complainRegistration(req, res);
  res.status(statusCodes?.created).send(companyData);
};



