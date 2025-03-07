import Bill from "../models/billing.model.js";
import Property from "../models/property.model.js";
import Tenant from "../models/tenant.model.js";
import { errorCodes, Message, statusCodes } from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import crypto from 'crypto';
// export const createbill = async (req, res) => {
//   const {
//     tenantId,
//     propertyId,
//     billingMonth,
//     rentAmount,
//     extraAmount,
//     electricityUnit,
//     electricityRate,
//     electricityBillAmount,
//     totalBillAmount,
//     companyId,
//     note
//   } = req.body;

//   const totalExtraAmount = extraCharges.reduce((sum, charge) => sum + charge.price, 0);

//   const newBill = await Bill.create({
//     tenantId,
//     propertyId,
//     billingMonth,
//     rentAmount,
//     extraAmount:totalExtraAmount,
//     electricityUnit,
//     electricityRate,
//     electricityBillAmount,
//     totalBillAmount,
//     companyId,
//     note
//   });

//   const property = await Property.findById(propertyId);
//   if (!property) {
//     throw new CustomError(
//       statusCodes?.notFound,
//       Message?.notFound,
//       errorCodes?.not_found
//     );
//   }

//   const tenant = await Tenant.findById(tenantId);
//   if (!tenant) {
//     throw new CustomError(
//       statusCodes?.notFound,
//       Message?.notFound,
//       errorCodes?.not_found
//     );
//   }
  
//   return newBill;
// };

export const createbill = async (req, res) => {
  const {
    tenantId,
    propertyId,
    billingMonth,
    rentAmount,
    extraCharges = [],
    electricityUnit,
    extraAmount,
    electricityRate,
    electricityBillAmount,
    totalBillAmount,
    companyId,
    note,
  } = req.body;

  const billingDate = new Date(billingMonth);
  const formattedBillingMonth = `${billingDate.toLocaleString('default', { month: 'long' }).toUpperCase()}`;
  
  const generateInvoiceNumber = () => {
    const prefix = "INV";
    const year = new Date().getFullYear().toString().slice(-2); 
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    return `${prefix}${year}${formattedBillingMonth}${randomNumbers}`;
  };
  

  const invoiceNo = generateInvoiceNumber();


  const newBill = await Bill.create({
    tenantId,
    propertyId,
    billingMonth,
    rentAmount,
    extraAmount, 
    extraCharges,
    invoiceNo:invoiceNo, 
    electricityUnit,
    electricityRate,
    electricityBillAmount,
    totalBillAmount,
    companyId,
    note,
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

export const getBillById = async(req) =>{
  const billId = req.query.id;
  const bill = await Bill.findById(billId)
  .populate("tenantId")
  .populate("propertyId")
  .populate("companyId")

  if (!bill ) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return bill
}