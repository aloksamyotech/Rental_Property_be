
import  Property  from "../models/property.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import jwt from 'jsonwebtoken';
import Owner from "../models/owner.model.js";
import Booking from "../models/booking,model.js";
import Company from "../models/company.model.js";


export const createProperty = async (req, res) => {
    const {
      propertyname,
      typeId,
      description,
      address,
      zipcode,
      maplink,
      rent,
      ownerId,
      companyId,
    } = req.body;

    const isPropertyAlreadyExist = await Property.findOne({ propertyname });
    if (isPropertyAlreadyExist) {
      return new CustomError(
        statusCodes?.notFound,
        Message?.notFound,
        errorCodes?.not_found,
      );
    }

    let filePaths = [];
    if (req.files && req.files.length > 0) {
      filePaths = req.files.map(file => `uploads/${file.filename}`);
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
      companyId,
      files: filePaths, 
    });

    return property
};


export const editProperty = async (req, res) => {
    const propertyId = req.query.id;

    if (!propertyId) {
      return res.status(400).json({
        message: "Property ID is required.",
        errorCode: "property_id_missing",
      });
    }

    const {
      propertyname,
      typeId,
      description,
      address,
      zipcode,
      maplink,
      rent,
      ownerId,
      companyId,
    } = req.body;

    let filePath = null;
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      if (file?.filename) {
        filePath = `uploads/property/${file.filename}`;
      } else {
        return res.status(400).json({
          message: "File upload failed",
          errorCode: "file_upload_error",
        });
      }
    }

    const updateData = {
      propertyname,
      typeId,
      description,
      address,
      zipcode,
      maplink,
      rent,
      ownerId,
      companyId,
      ...(filePath && { files: filePath }),
    };
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        message: "Property not found.",
        errorCode: "property_not_found",
      });
    }

    return updatedProperty;
  
};

export const getProperty = async(req, res, next) => {
  const companyId = req.query.id;
  const Properties = await Property.find({ companyId, isDeleted: false , isVacant: true}).sort({ createdAt: -1 });
  if (!Properties  ) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
    return Properties;
};


export const getAllProperties = async(req, res, next) => {
  const companyId = req.query.id;
  const Properties = await Property.find({ companyId, isDeleted: false }).sort({ createdAt: -1 });
  if (!Properties  ) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
    return Properties;
};


export const getVacantProperty = async(req, res, next) => {
  const companyId = req.query.id;
  const Properties = await Property.find({ companyId, isDeleted: false,isVacant: true }).sort({ createdAt: -1 });
  if (!Properties ) {
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

export const getPropertyById = async (req, res) => {
  const propertyId = req.query.id;

  // const booking = await Booking.findById(id)
  // .populate("tenantId")
  // .populate("propertyId")
  // .populate("companyId")
  // .sort({ createdAt: -1 })
  // .lean();

  const property = await Property.findById(propertyId)
  .populate("typeId")
  .populate("ownerId")
  .sort({ createdAt: -1 })
  .lean();

  if (!property) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }
  return property
};


export const uploadProperty = (req, res) => {
  const {id} = req.query;
  const company = Company.findById(id);
  if(!company){
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
  const Files = req.files;
  if (!req.files === 0) {
    return res.status(400).send('No files uploaded.');
  }
  return Files;
};


