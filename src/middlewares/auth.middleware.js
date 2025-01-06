import { asyncHandler } from "../utils/asyncWrapper.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import CustomError from "../utils/exception.js";
import { statusCodes } from "../core/common/constant.js";
import { Message } from "../core/common/constant.js";
import { errorCodes } from "../core/common/constant.js";
import Company from "../models/company.model.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  console.log(req.headers.token,"reqreqrreq");
  if (req?.headers?.token) {
    token = req?.headers?.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded,"decodeddecodeddecodeddecodeddecoded");
    const authenticatedUser = await Company.findById(decoded._id);

    if (!authenticatedUser) {
      throw new CustomError(
        statusCodes?.notFound,
        Message?.notFound,
        errorCodes?.not_found
      );
    }
    req.user = authenticatedUser;
    next();
  } else {
    throw new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable
    );
  }
});
