import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ownerSchema = new Schema(
  {
    ownerName: {
      type: String
    },
    email: {
      type: String
    },
    // password: {
    //   type: String
    // },
    phoneNo: {
      type: String
    },
    role: {
      type: String,
      default:"owner"
    },
    address: {
      type: String
    },
    isDeleted: {
      type: String,
      default: false
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },
    refreshToken: {
      type: String
    },
  },
  { timestamps: true },
);

ownerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

ownerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

ownerSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    email: this.email,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

ownerSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const Owner = mongoose.model("Owner", ownerSchema);

export default Owner;
