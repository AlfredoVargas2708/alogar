const { pool } = require("../db/config");

class ProductsController {
  async getProducts(req, res) {
    try {
      const { page, pageSize } = req.query;
      const limit = parseInt(pageSize, 10) || 10;
      const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * limit;

      const query = "SELECT * FROM products LIMIT $1 OFFSET $2";
      const result = await pool.query(query, [limit, offset]);

      res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error("Error en getProducts:", error);
      res.status(500).send({ message: "Internal Servel Error" });
    }
  }
}

module.exports = ProductsController;
