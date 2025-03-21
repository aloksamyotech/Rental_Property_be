
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",    // JPEG images
    "image/png",     // PNG images
    "application/pdf", // PDF files
    "application/msword", // Word documents (.doc)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word documents (.docx)
    "application/vnd.ms-excel", // Excel files (.xls)
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // Excel files (.xlsx)
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image, PDF, Word, and Excel files are allowed"), false);
  }
};


export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});
