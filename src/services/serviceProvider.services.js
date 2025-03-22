
import  ServiceProvider  from "../models/serviceprovider.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";


export const createServiceProvider = async (req, res) => {

    const {
      name,
      phoneNo,
      workType,
      address,
      companyId
    } = req.body;

    const serviceProvider = await ServiceProvider.create({
      name,
      phoneNo,
      workType,
      address,
      companyId
    });

    return serviceProvider
};


export const editServiceProvider = async (req, res) => {
    const serviceProviderId = req.query.id;

    if (!serviceProviderId) {
      return res.status(400).json({
        message: "Property ID is required.",
        errorCode: "property_id_missing",
      });
    }

    const {
      name,
      phoneNo,
      workType,
      address,
      companyId
    } = req.body;

    const updateData = {
      name,
      phoneNo,
      workType,
      address,
      companyId
    };
    const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
      serviceProviderId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedServiceProvider) {
      return res.status(404).json({
        message: "Service Provider not found.",
        errorCode: "Service Provider Error",
      });
    }

    return updatedServiceProvider;
  
};



export const deleteServiceProvider = async (req, res) => {
  const serviceProvider = req.query.id;

  const serviceProviderData = await ServiceProvider.findById(serviceProvider);
  if (!serviceProviderData) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound ,
      errorCodes?.not_found
    );
  } 

  serviceProviderData.isDeleted = true;
  await serviceProviderData.save();

  return serviceProviderData
};

export const getServiceProviders = async (req, res) => {
  const companyId = req.query.id;

  const serviceProvider = await ServiceProvider.find({
    companyId,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  if (!serviceProvider) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound ,
      errorCodes?.not_found
    );
  }
  return serviceProvider;
};
