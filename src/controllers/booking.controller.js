import * as tenantServices from "../services/tenant.services.js";
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";



export const bookProperty = async(req, res, next) => {
  const tenantData = await tenantServices.createTenant(req, res);
  res.status(statusCodes?.created).send(tenantData);
};

export const tenantLogin = async (req, res) => {
  const data = await tenantServices.loginTenant(req, res);
  res
    .status(statusCodes?.ok)
    .cookie("accessToken", data?.accessToken, data?.options)
    .cookie("refreshToken", data?.refreshToken, data?.options)
    .send(data?.loginTenant);
};
