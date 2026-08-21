const SORT_BY_ALLOWLIST = new Set(['due_date', 'priority', 'created_at', 'title']);
const ORDER_ALLOWLIST = new Set(['asc', 'desc']);

/**
 * Parses and validates sorting params from req.query.
 * @returns {sortBy, order1} or {error}
 */
function parseSortParams(req) {
  const rawSortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined;
  const rawOrder = typeof req.query.order === 'string' ? req.query.order : undefined;

  if (!rawSortBy && !rawOrder) {
    return { sortBy: 'created_at', order: 'desc' };
  }

  const sortBy = (rawSortBy || 'created_at').toString();
  const order = (rawOrder || 'desc').toString().toLowerCase();

  if (!SORT_BY_ALLOWLIST.has(sortBy) || !ORDER_ALLOWLIST.has(order)) {
    return { error: "Invalid 'sortBy' or 'order' parameter" };
  }

  return { sortBy, order };
}

function buildOrderByClause(sortBy, order) {
  const orderKeyword = order === 'asc' ? 'ASC' : 'DESC';

  if (sortBy === 'priority') {
    // Custom order: High > Medium > Low
    const weights =
      order === 'desc'
        ? { High: 3, Medium: 2, Low: 1 }
        : { High: 1, Medium: 2, Low: 3 };

    return `
      ORDER BY CASE priority
        WHEN 'High' THEN ${weights.High}
        WHEN 'Medium' THEN ${weights.Medium}
        WHEN 'Low' THEN ${weights.Low}
        ELSE 0
      END DESC, created_at DESC
    `;
  }

  return `ORDER BY ${sortBy } {orderKeyword}, created_at DESC`;
}

module.exports = { parseSortParams, buildOrderByClause };
