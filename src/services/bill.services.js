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
import {sendEmail} from "../core/helpers/mail.js"
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
    bookingId,
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
    bookingId,
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

     const CompanyDetails = await Company.findById(companyId);
    
      if(CompanyDetails.isMailStatus){
        sendTenantBillEmail(newBill,property,CompanyDetails,tenant);
      }
  

  return newBill;
};

const sendTenantBillEmail = async (newBill, property, CompanyDetails, tenant) => {
  try {
    // Generate extra charges list dynamically if there are extra charges
    const extraChargesList = newBill.extraCharges && newBill.extraCharges.length > 0
      ? newBill.extraCharges.map(charge => {
          return `<li><strong>${charge.serviceName}:</strong> $${charge.price}</li>`;
        }).join('') // Join the array elements into a string
      : `<li><strong>Extra Charges:</strong> None</li>`; // If no extra charges, show "None"

    // Email to Tenant with Billing Details
    const billDetails = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
      
      <!-- Header Section -->
      <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center;">
        <h2 style="margin: 0;">Your Bill from ${CompanyDetails.companyName}</h2>
      </div>

      <!-- Body Section -->
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; padding: 20px; box-sizing: border-box;">
        <p style="font-size: 16px; line-height: 1.6;">Dear ${tenant?.tenantName},</p>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for being a valued tenant at <strong>${CompanyDetails.companyName}</strong>. Below are the details of your latest bill for the property you are renting:</p>
        
        <ul style="font-size: 16px; line-height: 1.6;">
          <li><strong>Invoice No:</strong> ${newBill.invoiceNo}</li>
          <li><strong>Billing Month:</strong> ${new Date(newBill.billingMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</li>
          <li><strong>Property:</strong> ${property.propertyname}</li>
          <li><strong>Rent Amount:</strong> $${newBill.rentAmount}</li>
          ${extraChargesList} <!-- Dynamically add extra charges -->
          <li><strong>GST (${newBill.gstpercent}%):</strong> $${newBill.totalgst}</li>
          <li><strong>Total Bill Amount After GST:</strong> $${newBill.totalBillAmountAfterGST}</li>
          <li><strong>Note:</strong> ${newBill.note || "No additional notes"}</li>
          <li><strong>Payment Status:</strong> ${newBill.status || "No additional notes"}</li>
        </ul>

        <p style="font-size: 16px; line-height: 1.6;">Please ensure to make the payment before the due date. If you have any questions or concerns regarding your bill, feel free to contact us.</p>
      </div>

      <!-- Footer Section -->
      <div style="background-color: #f4f4f4; color: #777; text-align: center; padding: 15px;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0;"><strong>The ${CompanyDetails.companyName} Team</strong></p>
        <p>${CompanyDetails.email}</p>
      </div>
    </div>
    `;

    // Send the email to the tenant
    return sendEmail(
      tenant?.email,
      "Your Bill from " + CompanyDetails.companyName,
      billDetails,
      CompanyDetails._id
    );
  } catch (err) {
    console.error("Failed to send tenant bill email:", err);
  }
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

export const getBillByBookingId = async (req) => {
  const bookingId = req.query.id;
  const bill = await Bill.find({bookingId:bookingId})
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

  const bill = await Bill.findById(billId);
  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound ,
      errorCodes?.not_found
    );
  }

  bill.isDeleted = true;
  await bill.save();

  return bill;
};
