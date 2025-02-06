import Bill from "../models/billing.model.js";
import Property from "../models/property.model.js";
import Tenant from "../models/tenant.model.js";

export const createbill = async (req, res) => {
  const {
    tenantId,
    propertyId,
    billingMonth,
    rentAmount,
    extraAmount,
    electricityUnit,
    electricityRate,
    electricityBillAmount,
    totalBillAmount,
    companyId,
    note
  } = req.body;

  const newBill = await Bill.create({
    tenantId,
    propertyId,
    billingMonth,
    rentAmount,
    extraAmount,
    electricityUnit,
    electricityRate,
    electricityBillAmount,
    totalBillAmount,
    companyId,
    note
  });

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.not_found
    );
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.not_found
    );
  }
  
  return newBill;
};

export const getAllBill = async (req) => {
  const companyId = req.query.id;
  const AllBill = await Bill.find({companyId:companyId})
  .populate("tenantId", "tenantName")
  .populate("propertyId", "propertyname")
  .sort({ createdAt: -1 })

  if (!AllBill) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  return AllBill;
};


export const getBillByT = async(req) =>{
  const tenantId = req.query.id;
  const tenantBill = await Bill.find({tenantId: tenantId})
  .populate("tenantId")
  .populate("propertyId")
  .sort({ createdAt: -1 })

  if (!tenantBill ) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return tenantBill
}