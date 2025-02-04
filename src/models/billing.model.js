const mongoose = require('mongoose');
const { Schema } = mongoose;

const billSchema = new Schema({
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
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
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
},
{ timestamps: true },
);


const Bill = mongoose.model('Bill', billSchema);

export default Bill;

