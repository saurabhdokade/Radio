const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/signup");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
}

// Set up the storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in "uploads/signup" directory
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname); // Get file extension
    cb(null, Date.now() + fileExtension); // Generate unique filename
  },
});

// File filter for image, video, audio, and WhatsApp audio (.waptt) files
const fileFilter = (req, file, cb) => {
  // Allowed file types (including .waptt)
  const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mkv|avi|mov|wmv|flv|webm|3gp|ogg|mp3|wav|aac|m4a|waptt/;

  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype ? file.mimetype.toLowerCase() : "");

  // Also accept .waptt files directly (some .waptt files may have missing or non-standard MIME types)
  if (extName || path.extname(file.originalname).toLowerCase() === ".waptt") {
    cb(null, true);
  } else {
    cb(new Error("Only image, video, audio, PDF, or WhatsApp audio (.waptt) files are allowed!"), false);
  }
};

// Configure Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit (adjust if needed)
});

module.exports = upload;
