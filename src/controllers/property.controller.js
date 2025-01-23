import * as propertyServices from '../services/property.services.js';
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";



export const createProperty = async(req, res, next) => {
  const propertyData = await propertyServices.createProperty(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const editProperty = async(req, res, next) => {
  const propertyData = await propertyServices.editProperty(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const getProperty = async(req, res, next) => {
  const propertyData = await propertyServices.getProperty(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const deleteProperty = async(req, res, next) => {
  const propertyData = await propertyServices.deleteProperty(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const getById = async(req, res, next) => {
  const propertyData = await propertyServices.getProperty(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const getVacantProperty = async(req, res, next) => {
  const propertyData = await propertyServices.getVacantProperty(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

export const getPropertyById = async(req, res, next) => {
  const propertyData = await propertyServices.getPropertyById(req, res, next);
  res.status(statusCodes?.created).send(propertyData);
};

