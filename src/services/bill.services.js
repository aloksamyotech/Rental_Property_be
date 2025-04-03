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
import mongoose from "mongoose";

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
<li><strong>Payment Status:</strong> ${newBill.status ? "Paid" : "Pending"}</li>

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

export const getAllUnpaidBillForAgent =  async (req) => {
  const AgentId = req.query.id;
  const bill = await Bill.find({createdBy:AgentId, status:false});

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
  const CompanyId =  bill.companyId;
  const PropertyId = bill.propertyId;
  const TenantId = bill.tenantId;

  const CompanyDetails = await Company.findById(CompanyId);
  const property = await Property.findById(PropertyId);
  const tenant = await Tenant.findById(TenantId);
    
  if(CompanyDetails.isMailStatus){
    sendTenantBillEmail(bill,property,CompanyDetails,tenant);
  };

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

export const getMonthlyBillData = async(req,res)=>{
    const {companyId, year} = req.query;
// Define condition object to match documents
const condition_obj = { isDeleted: false }; // Ensure isDeleted is false

    if (companyId) {
      condition_obj.companyId = new mongoose.Types.ObjectId(companyId);
    }

    if (year) {
      condition_obj.billingMonth = {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`), // Start of the year
        $lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`), // Start of next year
      };
    }
    
    // Aggregation pipeline to group data by company and month
    const result = await Bill.aggregate([
      { $match: condition_obj }, // Match documents based on filters
      {
        $group: {
          _id: {
            companyId: "$companyId",
            billingMonth: { $month: "$billingMonth" }, 
            year: { $year: "$billingMonth" }, 
            status: "$status"
          },
          // totalRentAmount: { $sum: "$rentAmount" }, 
          // totalExtraCharges: { $sum: "$extraAmount" }, 
          // totalBillAmount: { $sum: "$totalBillAmount" }, 
          totalBillAmountAfterGST: { $sum: "$totalBillAmountAfterGST" }, 
          totalGST: { $sum: "$totalgst" }, 
          bills: { $push: "$$ROOT" }, // Push the full document for each bill
        },
      },
      {
        $sort: { "_id.year": 1, "_id.billingMonth": 1 }, 
      },
      {
        $project: {
          companyId: "$_id.companyId", 
          year: "$_id.year",
          month: "$_id.billingMonth", 
          // totalRentAmount: 1, 
          // totalExtraCharges: 1, 
          // totalBillAmount: 1, 
          totalBillAmountAfterGST: 1, 
          totalGST: 1, 
          bills: 1,
        },
      },
    ]);

    return result;

}


// export const getTotalSales = async (req) => {
//   try {
//     const { year, companyId } = req?.query; // Fetch year and companyId from query params
//     const condition_obj = { isDeleted: false, status: true };

//     if (companyId) {
//       condition_obj["companyId"] = companyId; // Ensure companyId is used for filtering
//     }

//     if (year) {
//       condition_obj["createdAt"] = {
//         $gte: new Date(`${year}-01-01`),
//         $lt: new Date(`${parseInt(year) + 1}-01-01`),
//       };
//     }

//     // Perform the aggregation query on the Bill model
//     const bill = await Bill.aggregate([
//       { $match: condition_obj }, // Match the conditions including companyId and year
//       {
//         $project: {
//           billingMonth: { $month: "$billingMonth" },
//           year: { $year: "$billingMonth" },
//           totalBillAmountAfterGST: 1, // Include the total bill amount after GST
//         },
//       },
//       {
//         $group: {
//           _id: { month: "$billingMonth", year: "$year", companyId: "$companyId" }, // Group by companyId, year, and month
//           totalBillAmountAfterGST: { $sum: "$totalBillAmountAfterGST" },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sort by year and month
//     ]);

//     // Prepare months of the year
//     const months = [
//       "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//     ];

//     // Initialize an array to store the formatted data with a default of 0 for each month
//     const formattedData = months.map((month, index) => {
//       const monthData = bill.find(
//         (data) => data._id.month === index + 1 && data._id.year === parseInt(year)
//       );
//       return monthData ? monthData.totalBillAmountAfterGST : 0;
//     });

//     // Return the formatted data (total sales by month)
//     return formattedData;
//   } catch (error) {
//     console.error("Error fetching total sales for the month:", error);
//     throw new Error("Data not found");
//   }
// };
export const getTotalSalesForMonth = async (req) => {
    const { companyId, year } = req?.query;
    const condition_obj = { isDeleted: false, status: true };
    if (companyId) {
      condition_obj.companyId = new mongoose.Types.ObjectId(companyId);
    }
    if (year) {
      condition_obj["updatedAt"] = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }
    const totalAmount = await Bill.aggregate([
      { $match: condition_obj },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          total_sales_amount: { $sum: "$totalBillAmountAfterGST" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedData = months.map((month, index) => {
      const monthData = totalAmount.find((data) => data._id === index + 1);
      return monthData ? monthData.total_sales_amount : 0;
    });
    return formattedData;

};


export const getTotalSalesForYear = async (req) => {
  // try {
    const { companyId, year } = req?.query;
    const condition_obj = { isDeleted: false,status: true  };

    if (companyId) {
      condition_obj.companyId = new mongoose.Types.ObjectId(companyId);
    }
    if (year) {
      condition_obj["createdAt"] = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const totalYearlySales = await Bill.aggregate([
      { $match: condition_obj },
      {
        $group: {
          _id: null,
          total_sales_amount: { $sum: "$totalBillAmountAfterGST" },
        },
      },
    ]);

    return totalYearlySales
  // } catch (error) {
  //   console.error("Error fetching total sales for the year:", error);
  //   throw new Error(messages.data_not_found);
  // }
};


export const totalPendingBills = async (req) => {
  const companyId = req.query.id;
  const bill = await Bill.find({ companyId:companyId, status: false })

  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return bill;
};

export const totalPaidBills = async (req) => {
  const companyId = req.query.id;
  const bill = await Bill.find({ companyId:companyId, status: true })

  if (!bill) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound,
      errorCodes?.no_data_found
    );
  }
  return bill;
};


