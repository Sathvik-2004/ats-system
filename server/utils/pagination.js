const parsePagination = (query = {}, defaults = {}) => {
  const defaultPage = defaults.page || 1;
  const defaultLimit = defaults.limit || 10;
  const maxLimit = defaults.maxLimit || 100;

  const page = Math.max(1, parseInt(query.page, 10) || defaultPage);
  const limit = Math.max(1, Math.min(maxLimit, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const toPaginationMeta = ({ page, limit, totalItems }) => ({
  currentPage: page,
  itemsPerPage: limit,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / limit))
});

module.exports = { parsePagination, toPaginationMeta };
