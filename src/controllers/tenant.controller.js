import * as tenantServices from "../services/tenant.services.js";
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";



export const createTenant = async(req, res, next) => {
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

export const getTenants = async(req, res, next) => {
  const propertyData = await tenantServices.getTenants(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const mybookings = async(req, res, next) => {
  const bookingData = await tenantServices.mybooking(req, res, next);
  res.status(statusCodes?.created).send(bookingData);
};

export const getTenantsById = async(req, res, next) => {
  const propertyData = await tenantServices.getTenantsById(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const editTenant = async(req, res) => {
  const propertyData = await tenantServices.editTenant(req, res);
  res.status(statusCodes?.created).send(propertyData);
};

export const deleteTenantById = async(req, res) => {
  const deletedData = await tenantServices.deleteTenantById(req, res);
  res.status(statusCodes?.created).send(deletedData);
};