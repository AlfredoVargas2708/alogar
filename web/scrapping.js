// web/scrapping.js
const axios = require("axios");
const cheerio = require("cheerio");
const { pool } = require("../db/config");
const baseUrl = "https://alogar.cl/collections/all";

async function webScrapping() {
  try {
    const { data } = await axios.get(baseUrl);
    const $ = cheerio.load(data);

    const pagination = $(".pagination__text").text().trim();

    const actualPage = pagination.split(" ")[1];
    const finalPage = pagination.split(" ")[3];

    let finalProducts = [];

    for (let i = actualPage; i <= finalPage; i++) {
      const { data: pageData } = await axios.get(`${baseUrl}?page=${i}`);
      const $ = cheerio.load(pageData);

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

      finalProducts.push(products);
    }

    finalProducts = finalProducts.flat();

    const selectQuery = "SELECT * FROM products";
    const productsInDB = await pool.query(selectQuery);

    if (productsInDB.rows.length === 0) {
      const values = [];
      const placeholders = finalProducts
        .map((_, i) => {
          const offset = i * 4;
          values.push(
            finalProducts[i].name,
            finalProducts[i].price,
            finalProducts[i].image,
            finalProducts[i].link
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
        `Se insertaron ${finalProducts.length} productos (o se ignoraron si ya existían).`
      );
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
