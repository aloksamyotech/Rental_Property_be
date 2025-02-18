import Announcement from "../models/announcement.model.js";

export const createAnnouncement = async (req, res) => {
  const {
    topic,
    details,
    companyId
  } = req.body;

  const newAnnouncement = await Announcement.create({
    topic,
    details,
    companyId
  });

  
  return newAnnouncement;
};

export const editAnnouncement = async(req, res, next) => {
  const id = req.query.id;
  const updateData = req.body; 
  const editAmmouncement = await Announcement.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true } 
  ) 

  if (!updateData) {
    return new CustomError(
      statusCodes?.serviceUnavailable,
      Message?.serverError,
      errorCodes?.service_unavailable,
    );
  }
    return editAmmouncement;
};

export const getAllAnnouncement = async (req) => {
  const companyId = req.query.id;
  const allAnnouncement  = await Announcement.find({companyId:companyId})
  .sort({ createdAt: -1 })

  if (!allAnnouncement) {
    throw new CustomError(
      statusCodes?.conflict,
      Message?.alreadyExist,
      errorCodes?.already_exist
    );
  }

  return allAnnouncement;
};


export const deleteAnnounment = async (req, res) => {
  const id = req.query.id;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new CustomError(
      statusCodes?.notFound,
      Message?.notFound || "Tenant not found",
      errorCodes?.not_found
    );
  }

  announcement.isDeleted = true;
  await announcement.save();
  return announcement 
};