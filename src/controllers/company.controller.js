// import * as compa from "../services/owner.services.js";
import * as companyServices from "../services/company.services.js";
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";

export const companyRegistration = async (req, res) => {
  const companyData = await companyServices.companyRegistration(req, res);
  res.status(statusCodes?.created).send(companyData);
};

export const universalLogin = async (req, res) => {
  const data = await companyServices.universalLogin(req, res);
  console.log("....................................>>>>>>>>>>>>>>>", data);
  res
    .status(statusCodes?.ok)
    .cookie("accessToken", data?.accessToken, data?.options)
    .cookie("refreshToken", data?.refreshToken, data?.options)
    .send(data);
};

export const getAllCompany = async (req, res) => {
  const companyData = await companyServices.getAllCompany(req, res);
  res.status(statusCodes?.created).send(companyData);
};

export const editCompany = async (req, res) => {
  const companyData = await companyServices.editCompany(req, res);
  res.status(statusCodes?.created).send(companyData);
};

export const deleteCompany = async (req, res) => {
  const companyData = await companyServices.deleteCompany(req, res);
  res.status(statusCodes?.created).send(companyData);
};

export const commentAndResolved = async (req, res) => {
  const companyData = await companyServices.commentAndResolved(req, res);
  res.status(statusCodes?.created).send(companyData);
};