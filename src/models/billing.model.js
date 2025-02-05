import mongoose,{ Schema } from "mongoose";


const billSchema = new Schema({
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant'
  },
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property'
  },
  billingMonth: { 
    type: Date, 
    required: true 
  },
  rentAmount: { 
    type: Number, 
    min: 0 
  },
  extraAmount: { 
    type: Number, 
    min: 0 
  },
  electricityUnit: { 
    type: Number, 
   
    min: 0 
  },
  electricityRate: { 
    type: Number, 
    min: 0 
  },
  electricityBillAmount: { 
    type: Number, 
    min: 0 
  },
  totalBillAmount: { 
    type: Number, 
    min: 0 
  },
  billDuration: { 
    type: Number, 
    min: 1 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
  },
  note:{
    type: String
  },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company'
  },
},
{ timestamps: true },
);


const Bill = mongoose.model('Bill', billSchema);

export default Bill;

