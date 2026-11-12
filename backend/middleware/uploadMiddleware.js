const multer = require('multer');

// Temporarily store uploaded images in memory
const storage = multer.memoryStorage();

// Allowed image formats
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

// Validate image formats
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only JPG, PNG and WEBP images are allowed.'),
      false
    );
  }
};

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 3 // Maximum 3 images
  }
});

module.exports = upload;