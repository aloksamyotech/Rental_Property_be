import Bill from "../models/billing.model.js";
import Property from "../models/property.model.js";
import Tenant from "../models/tenant.model.js";
import {
  errorCodes,
  invoicePrefix,
  Message,
  statusCodes,
} from "../core/common/constant.js";
import CustomError from "../utils/exception.js";
import crypto from "crypto";
import Agent from "../models/agents.model.js";
import Company from "../models/company.model.js";
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
    gstpercent,
    electricityBillAmount,
    totalBillAmount,
    companyId,
    note,
    totalBillAmountAfterGST,
    totalgst,
    createdBy
  } = req.body;

  const billingDate = new Date(billingMonth);
  const formattedBillingMonth = `${billingDate
    .toLocaleString("default", { month: "long" })
    .toUpperCase()}`;

  const generateInvoiceNumber = () => {
    const prefix = invoicePrefix.prefix;
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
    gstpercent,
    invoiceNo: invoiceNo,
    electricityUnit,
    electricityRate,
    electricityBillAmount,
    totalBillAmount,
    companyId,
    note,
    totalBillAmountAfterGST,
    totalgst,
    createdBy
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
  const AllBill = await Bill.find(
    {  companyId: companyId, isDeleted: false  }
  )
    .populate("tenantId", "tenantName")
    .populate("propertyId", "propertyname")
    .lean()
    .sort({ createdAt: -1 });

  if (!AllBill) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  
    const finalResponse = [];
    for (const bill of AllBill) {
      const createdBy = bill.createdBy;
  
      let creater = await Agent.findById(createdBy);
      let name;
      if (creater) {
        name = creater.agentName;
      } else {
        creater = await Company.findById(createdBy);
        if (creater) {
          name = creater.companyName;
        }
      }
      finalResponse.push({ name, ...bill });
    }

  return finalResponse;
};


export const getBillByT = async (req) => {
  const tenantId = req.query.id;
  const tenantBill = await Bill.find({ tenantId: tenantId , isDeleted: false})
    .populate("tenantId")
    .populate("propertyId")
    .sort({ createdAt: -1 });

  if (!tenantBill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return tenantBill;
};

export const getBillById = async (req) => {
  const billId = req.query.id;
  const bill = await Bill.findById(billId)
    .populate("tenantId")
    .populate("propertyId")
    .populate("companyId");

  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return bill;
};

export const getBillByCreaterBy =  async (req) => {
  const AgentId = req.query.id;
  const bill = await Bill.find({createdBy:AgentId})
    .populate("tenantId")
    .populate("propertyId")
    .populate("companyId");

  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return bill;
};

export const reporterDetails = async (req) => {
  const repoterId = req.query.id;
  const bill = await Bill.findById(repoterId)
    .populate("tenantId")
    .populate("propertyId")
    .populate("companyId");

  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return bill;
};

export const changeBillStatus = async (req) => {
  const billId = req.query.id;
  const { paymentType } = req.body;

  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }

  bill.status = true;
  bill.paymentType = paymentType;

  await bill.save();
  return bill;
};

export const deleteBill = async (req, res) => {
  const billId = req.query.id;
  console.log(billId, "billIdbillIdbillIdbillId");

  const bill = await Bill.findById(billId);
  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Bill not found",
      errorCodes?.not_found
    );
  }

  bill.isDeleted = true;
  await bill.save();

  return bill;
};
