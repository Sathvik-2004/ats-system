const { getCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const User = require('../models/User');
const { logAction } = require('./auditController');
const AppError = require('../utils/AppError');
const { success } = require('../utils/response');

const uploadResumeToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const cloudinary = getCloudinary();
    if (!cloudinary || !isCloudinaryConfigured()) {
      throw new AppError('Cloudinary is not configured. Set CLOUDINARY_* environment variables.', 503);
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'ats-system/resumes',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: {
          filename: req.file.originalname,
          url: uploaded.secure_url,
          uploadedAt: new Date()
        },
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password').lean();

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'upload',
      resourceType: 'resume',
      resourceId: req.user.id,
      resourceName: req.file.originalname,
      details: { provider: 'cloudinary', bytes: req.file.size },
      ipAddress: req.ip
    });

    return success(
      res,
      {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        user
      },
      { statusCode: 201, message: 'Resume uploaded successfully' }
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = { uploadResumeToCloudinary };
