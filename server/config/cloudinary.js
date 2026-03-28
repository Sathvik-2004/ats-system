let cloudinary;

try {
  ({ v2: cloudinary } = require('cloudinary'));
} catch (_error) {
  cloudinary = null;
}

const isCloudinaryConfigured = () => {
  return Boolean(
    cloudinary &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const getCloudinary = () => {
  if (!cloudinary) {
    return null;
  }

  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }

  return cloudinary;
};

module.exports = { getCloudinary, isCloudinaryConfigured };
