function createPagination(result, page, limit) {
  const offset = (page - 1) * limit;

  const allProducts = result.rows;
  const totalItems = allProducts.length;

  const paginatedProducts = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(totalItems / limit);

  return { page, limit, totalItems, paginatedProducts, totalPages }
}

module.exports = { createPagination }
