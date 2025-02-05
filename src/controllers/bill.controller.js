import * as billServices from "../services/bill.services.js"
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";

export const createbill = async(req, res, next) => {
  const billData = await billServices.createbill(req, res);
  res.status(statusCodes?.created).send(billData);
};
