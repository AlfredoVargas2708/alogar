// web/scrapping.js
const axios = require("axios");
const cheerio = require("cheerio");
const { pool } = require("../db/config");

async function webScrapping() {
  try {
    const { data } = await axios.get("https://alogar.cl/collections/all");
    const $ = cheerio.load(data);

    const products = $(".grid-view-item.product-card")
      .map((_, product) => {
        const name = capitalize(
          $(product).find(".product-card__title").text().trim()
        );
        const price = Number(
          $(product)
            .find(".price-item.price-item--regular")
            .text()
            .trim()
            .replace("$", "")
            .replace(".", "")
        );
        const image = `https:${$(product)
          .find("img")[0]
          .attribs["data-src"].replace("{width}", "180")}`;
        const link = `https://alogar.cl${
          $(product).find(".grid-view-item__link")[0].attribs["href"]
        }`;

        return { name, price, image, link };
      })
      .toArray();

    if (products.length > 0) {
      // Preparar parámetros dinámicamente
      const values = [];
      const placeholders = products
        .map((_, i) => {
          const offset = i * 4;
          values.push(
            products[i].name,
            products[i].price,
            products[i].image,
            products[i].link
          );
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${
            offset + 4
          })`;
        })
        .join(", ");

      const insertQuery = `
        INSERT INTO products (product_name, product_price, product_image, product_link)
        VALUES ${placeholders}
      `;

      await pool.query(insertQuery, values);
      console.log(
        `Se insertaron ${products.length} productos (o se ignoraron si ya existían).`
      );
    } else {
      console.log("No se encontraron productos.");
    }
  } catch (error) {
    console.error("Error en webScrapping:", error);
    throw error;
  }
}

function capitalize(text) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

module.exports = { webScrapping };
