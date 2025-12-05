import pool from "../db.js";

const searchSamples = async (req, res) => {
  try {
    const { search, duration, order, page = 1 } = req.query;

    const pageSize = 20;
    const offset = (parseInt(page) - 1) * pageSize;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`search_vector @@ plainto_tsquery($${paramIndex})`);
      params.push(search);
      paramIndex++;
    }

    if (duration) {
      if (duration === "short") {
        conditions.push(`s.duration < 10`);
      } else if (duration === "medium") {
        conditions.push(`s.duration >= 10 AND s.duration <= 30`);
      } else if (duration === "long") {
        conditions.push(`s.duration > 30`);
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sortOrder = order === "oldest" ? "ASC" : "DESC";
    const orderByClause = `ORDER BY s.created_at ${sortOrder}`;

    const countQuery = `SELECT COUNT(*) FROM samples s ${whereClause}`;
    const countResult = await pool.query(countQuery, params);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / pageSize);

    const dataQuery = `
      SELECT s.*
      FROM samples s
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(pageSize, offset);
    const result = await pool.query(dataQuery, params);

    res.status(200).json({
      samples: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        pageSize,
      },
    });
  } catch (err) {
    console.error("Error searching samples:", err);
    res.status(500).json({ error: "Failed to search samples" });
  }
};

export { searchSamples };
