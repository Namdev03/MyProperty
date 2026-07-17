import multer from "multer";

// Memory storage: files stay in RAM as a Buffer so they can be streamed
// straight to Cloudinary without ever touching disk (see utils/uploadToCloudinary.js).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});
