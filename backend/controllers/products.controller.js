const { pool } = require("../db/config");

class ProductsController {
  async getProducts(req, res) {
    try {
      const { page, pageSize } = req.query;
      const limit = parseInt(pageSize, 10) || 10;
      const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * limit;

      const query = `SELECT 
          p.id,
          p.product_name,
          p.product_price,
          array_agg(c.category_name) AS categories
        FROM 
          products p
        JOIN 
          product_categories pc ON p.id = pc.product_id
        JOIN 
          categories c ON pc.category_id = c.id
        GROUP BY 
          p.id
        LIMIT $1 OFFSET $2`;
      const result = await pool.query(query, [limit, offset]);

      res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error("Error en getProducts:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getProductByName(req, res) {
    try {
      const { product } = req.params;

      const query = `SELECT 
          p.id,
          p.product_name,
          p.product_price,
          array_agg(c.category_name) AS categories
        FROM 
          products p
        JOIN 
          product_categories pc ON p.id = pc.product_id
        JOIN 
          categories c ON pc.category_id = c.id
        WHERE
          p.product_name ILIKE $1
        GROUP BY 
          p.id
        ORDER BY
          p.id`;
      const result = await pool.query(query, [`%${product}%`]);
      res.status(200).send({ data: result.rows });
    } catch (error) {
      console.error("Error en getProductByName:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getProductsByCategories(req, res) {
    try {
      // Recibimos un string de IDs separados por comas: "1,5,8"
      const { category_ids } = req.params;

      // Convertimos a array de números
      const idsArray = category_ids.split(",").map((id) => parseInt(id.trim()));

      // Validación
      if (!idsArray.every((id) => Number.isInteger(id))) {
        return res.status(400).send({ message: "IDs de categoría inválidos" });
      }

      const query = `
          SELECT 
            p.id,
            p.product_name,
            p.product_price,
            array_agg(c.category_name) AS categories
          FROM 
            products p
          JOIN 
            product_categories pc ON p.id = pc.product_id
          JOIN 
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

      // Ejecutar con el array de IDs y el conteo esperado
      const result = await pool.query(query, [idsArray, idsArray.length]);

      if (result.rows.length === 0) {
        return res.status(404).send({
          message: "No se encontraron productos para estas categorías",
        });
      }

      res.status(200).send({ data: result.rows });
    } catch (error) {
      console.error("Error en getProductsByCategories:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

module.exports = ProductsController;
