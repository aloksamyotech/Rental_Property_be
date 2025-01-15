
import  Property  from "../models/property.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import jwt from 'jsonwebtoken';
import Owner from "../models/owner.model.js";



export const createProperty = async(req, res) => {
  const {
    propertyname, 
    typeId, 
    description, 
    address, 
    zipcode, 
    maplink,
    rent,
    ownerId,
    companyId
  } = req.body; 


  const isPropertyAlreadyExist = await Property.findOne({ propertyname });
  if (isPropertyAlreadyExist) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist,
    );
  }

  const property = await Property.create({
    propertyname, 
    typeId, 
    description, 
    address, 
    zipcode, 
    maplink,
    rent,
    ownerId,
    companyId
  });

  return property;
};

export const editProperty = async(req, res, next) => {
  const property = req.query.id;
  const updateData = req.body; 
  const editProperty = await Property.findByIdAndUpdate(
    property,
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
    return editProperty;
};

export const getProperty = async(req, res, next) => {
  const companyId = req.query.id;
  const Properties = await Property.find({ companyId, isDeleted: false }).sort({ createdAt: -1 });
  // if (!tenants || tenants.length === 0) {
  if (!Properties  || Properties.length === 0) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
  console.log("PropertiesPropertiesPropertiesProperties",Properties);
    return Properties;
};


export const deleteProperty = async (req, res) => {
  const propertyId = req.query.id;

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }

  property.isDeleted = true;
  await property.save();

  return property
};


