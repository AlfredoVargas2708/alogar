const { pool } = require("../db/config");
const { createPagination } = require("../functions/createPagination");

class ProductsController {
  async getProducts(req, res) {
    try {
      const query = `SELECT 
          p.id,
          p.product_name,
          p.product_price,
          p.product_weighable,
          p.product_link,
          array_agg(c.category_name) AS categories
        FROM 
          products p
        LEFT JOIN 
          product_categories pc ON p.id = pc.product_id
        LEFT JOIN 
          categories c ON pc.category_id = c.id
        GROUP BY 
          p.id
        ORDER BY
          p.id`;
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
      console.error("Error en getProducts:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getProductByName(req, res) {
    try {
      const { product } = req.params;

      if (!req.query.page || !req.query.limit) {
        return res
          .status(404)
          .send({ message: "Faltan valores para la páginación" });
      }

      const query = `SELECT 
        p.id,
        p.product_name,
        p.product_price,
        p.product_weighable,
        p.product_link,
        array_agg(c.category_name) AS categories
      FROM 
        products p
      LEFT JOIN 
        product_categories pc ON p.id = pc.product_id
      LEFT JOIN 
        categories c ON pc.category_id = c.id
      WHERE
        p.product_name ILIKE $1
      GROUP BY 
        p.id
      ORDER BY
        p.id`;

      const result = await pool.query(query, [`%${product}%`]);

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
      console.error("Error en getProductByName:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getProductsByCategories(req, res) {
    try {
      const { category_ids } = req.params;

      const idsArray = category_ids.split(",").map((id) => parseInt(id.trim()));

      if (!idsArray.every((id) => Number.isInteger(id))) {
        return res.status(400).send({ message: "IDs de categoría inválidos" });
      }

      if (!req.query.page || !req.query.limit) {
        return res
          .status(404)
          .send({ message: "Faltan valores para la páginación" });
      }

      const query = `
          SELECT 
            p.id,
            p.product_name,
            p.product_price,
            p.product_weighable,
            p.product_link,
            array_agg(c.category_name) AS categories
          FROM 
            products p
          LEFT JOIN 
            product_categories pc ON p.id = pc.product_id
          LEFT JOIN 
            categories c ON pc.category_id = c.id
          WHERE
            (SELECT COUNT(*) 
            FROM product_categories pc 
            WHERE pc.product_id = p.id 
            AND pc.category_id = ANY($1::int[])
            ) = $2  -- Debe tener todas las categorías
          GROUP BY
            p.id
          ORDER BY
            p.product_name`;

      const result = await pool.query(query, [idsArray, idsArray.length]);

      if (result.rows.length === 0) {
        return res.status(404).send({
          message: "No se encontraron productos para estas categorías",
        });
      }

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
      console.error("Error en getProductsByCategories:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getProductByCode(req, res) {
    try {
      const { code } = req.params;

      if (!req.query.page || !req.query.limit) {
        return res
          .status(404)
          .send({ message: "Faltan valores para la páginación" });
      }

      const query = `SELECT 
          p.id,
          p.product_name,
          p.product_price,
          p.product_weighable,
          p.product_link,
          array_agg(c.category_name) AS categories
        FROM 
          products p
        LEFT JOIN 
          product_categories pc ON p.id = pc.product_id
        LEFT JOIN 
          categories c ON pc.category_id = c.id
        WHERE
          p.product_code = $1
        GROUP BY 
          p.id
        ORDER BY
          p.id`;
      const result = await pool.query(query, [code]);

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
      console.error("Error in getProductByCode", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

module.exports = ProductsController;
