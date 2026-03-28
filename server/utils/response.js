const success = (res, data = null, options = {}) => {
  const { statusCode = 200, message = '', meta, extra } = options;
  const payload = { success: true };

  if (message) payload.message = message;
  if (data !== null) payload.data = data;
  if (meta) payload.meta = meta;
  if (extra && typeof extra === 'object') {
    Object.assign(payload, extra);
  }

  return res.status(statusCode).json(payload);
};

const paginated = (res, data, pagination, options = {}) => {
  return success(res, data, {
    ...options,
    meta: {
      ...(options.meta || {}),
      pagination
    }
  });
};

const failure = (res, message, options = {}) => {
  const { statusCode = 500, code, details, meta } = options;
  const payload = {
    success: false,
    message: message || 'Request failed'
  };

  if (code) payload.code = code;
  if (details) payload.details = details;
  if (meta) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

module.exports = { success, paginated, failure };
