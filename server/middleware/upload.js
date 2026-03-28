const AppError = require('../utils/AppError');

let multer;
try {
  multer = require('multer');
} catch (_error) {
  multer = null;
}

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ensureMulterInstalled = (req, _res, next) => {
  if (!multer) {
    return next(new AppError('File upload package is not installed. Run npm install multer.', 503));
  }
  return next();
};

const createSingleFileUpload = (fieldName, maxFileSizeMB = 5) => {
  if (!multer) {
    return [ensureMulterInstalled];
  }

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new AppError('Invalid file type. Only PDF, DOC, DOCX are allowed.', 400));
      }
      return cb(null, true);
    }
  });

  return [upload.single(fieldName)];
};

module.exports = { createSingleFileUpload };
