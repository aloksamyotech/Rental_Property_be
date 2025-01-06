import * as agentServices from '../services/agent.services.js';
import { Message, statusCodes } from "../core/common/constant.js";
import { asyncHandler } from "../utils/asyncWrapper.js";
import CustomError from "../utils/exception.js";



export const createAgent = async(req, res, next) => {
  const agentData = await agentServices.createAgent(req, res);
  res.status(statusCodes?.created).send(agentData);
};

export const agentLogin = async (req, res) => {
  const data = await agentServices.loginAgent(req, res);
  res
    .status(statusCodes?.ok)
    .cookie("accessToken", data?.accessToken, data?.options)
    .cookie("refreshToken", data?.refreshToken, data?.options)
    .send(data?.loginAgent);
};

export const editAgent = async(req, res, next) => {
  const agentData = await agentServices.editAgent(req, res);
  res.status(statusCodes?.created).send(agentData);
};


export const getAllAgent = async(req, res, next) => {
  const agentData = await agentServices.getAllAgent(req, res);
  res.status(statusCodes?.created).send(agentData);
};

export const deleteAgent = async(req, res, next) => {
  const agentData = await agentServices.deleteAgent(req, res);
  res.status(statusCodes?.created).send(agentData);
};