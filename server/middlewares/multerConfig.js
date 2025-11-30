const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the destination directory
const uploadDir = path.join(__dirname, "../uploads/ecgs");

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename: patientId-timestamp-originalfilename
    // We'll get patientId from the body, but it's safer to use Date.now()
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to accept only allowed formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mat/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Only .png, .jpg, and .mat files are allowed!"));
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;