const { pool } = require("../db/config");
const { createPagination } = require("../functions/createPagination");

class SalesController {
  async getSales(req, res) {
    try {
      if (!req.query.page || !req.query.limit) {
        return res
          .status(404)
          .send({ message: "Faltan valores para la páginación" });
      }

      const query = `
                SELECT
                    s.id,
                    s.total_sale,
                    s.date_sale,
                    p.id,
                    p.product_price,
                    ps.cant_product
                FROM
                    sales s
                LEFT JOIN
                    products_sale ps ON ps.id_sale = s.id
                LEFT JOIN
                    products p ON ps.id_product = p.id
                GROUP BY
                    s.id, p.id, p.product_price, ps.cant_product
                ORDER BY s.id`;
      const result = await pool.query(query);

      const paginationCreated = createPagination(
        result,
        parseInt(req.query.page),
        parseInt(req.query.limit)
      );

      res.status(200).send({
        data: paginationCreated.paginatedItems,
        pagination: {
          totalItems: paginationCreated.totalItems,
          totalPages: paginationCreated.totalPages,
          currentPage: paginationCreated.page,
          itemsPerPage: paginationCreated.limit,
        },
      });
    } catch (error) {
      console.error("Error in getSales:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getSalesBetween(req, res) {
    try {
      const { initial, final, page, limit } = req.query;

      if (!initial || !final || !page || !limit) {
        return res.status(404).send({ message: "Faltan valores" });
      }
      const query = `
                SELECT
                    s.id,
                    s.total_sale,
                    s.date_sale,
                    p.id,
                    p.product_price,
                    ps.cant_product
                FROM
                    sales s
                LEFT JOIN
                    products_sale ps ON ps.id_sale = s.id
                LEFT JOIN
                    products p ON ps.id_product = p.id
                WHERE
                    s.date_sale >= $1 AND s.date_sale < $2
                GROUP BY
                    s.id, p.id, p.product_price, ps.cant_product
                ORDER BY s.date_sale`;
      const result = await pool.query(query, [initial, final]);

      const paginationCreated = createPagination(
        result,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).send({
        data: paginationCreated.paginatedItems,
        pagination: {
          totalItems: paginationCreated.totalItems,
          totalPages: paginationCreated.totalPages,
          currentPage: paginationCreated.page,
          itemsPerPage: paginationCreated.limit,
        },
      });
    } catch (error) {
      console.error("Error in getSalesBetween", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

module.exports = SalesController;
