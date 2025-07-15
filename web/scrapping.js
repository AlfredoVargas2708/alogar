// web/scrapping.js
const axios = require("axios");
const cheerio = require("cheerio");
const { pool } = require("../db/config");
const productsBaseUrl = "https://alogar.cl/collections/all";
const categoriesBaseUrl = "https://alogar.cl";

async function webScrappingProducts() {
  try {
    const { data } = await axios.get(productsBaseUrl);
    const $ = cheerio.load(data);

    const pagination = $(".pagination__text").text().trim();

    const actualPage = pagination.split(" ")[1];
    const finalPage = pagination.split(" ")[3];

    let finalProducts = [];

    for (let i = actualPage; i <= finalPage; i++) {
      const { data: pageData } = await axios.get(
        `${productsBaseUrl}?page=${i}`
      );
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
      await insertInDB(
        "products",
        ["product_name", "product_price", "product_image", "product_link"],
        finalProducts,
        (item, col) => {
          const map = {
            product_name: item.name,
            product_price: item.price,
            product_image: item.image,
            product_link: item.link,
          };
          return map[col];
        }
      );
      await relateProductsWithCategories();
    } else {
      if (productsInDB.rows.length === finalProducts.length) {
        console.log("No hay productos nuevos que insertar");
      } else if (productsInDB.rows.length > finalProducts.length) {
        const linksFromWeb = new Set(finalProducts.map((p) => p.link));
        const productosAEliminar = productsInDB.rows.filter(
          (p) => !linksFromWeb.has(p.product_link)
        );

        for (const producto of productosAEliminar) {
          await pool.query("DELETE FROM products WHERE product_link = $1", [
            producto.product_link,
          ]);
        }

        console.log(
          `Se eliminaron ${productosAEliminar.length} productos que ya no están en la web.`
        );
      } else if (productsInDB.rows.length < finalProducts.length) {
        const linksFromDB = new Set(
          productsInDB.rows.map((p) => p.product_link)
        );
        const productsToInsert = finalProducts.filter(
          (p) => !linksFromDB.has(p.link)
        );

        await insertInDB(
          "products",
          ["product_name", "product_price", "product_image", "product_link"],
          productsToInsert,
          (item, col) => {
            const map = {
              product_name: item.name,
              product_price: item.price,
              product_image: item.image,
              product_link: item.link,
            };
            return map[col];
          }
        );
        await relateProductsWithCategories();
      }
    }
  } catch (error) {
    console.error("Error en webScrappingProducts:", error);
    throw error;
  }
}

async function webScrappingCatergories() {
  try {
    const { data } = await axios.get(categoriesBaseUrl);
    const $ = cheerio.load(data);

    const categories = $(".collection-grid-item")
      .map((_, category) => {
        let name = capitalize(
          $(category).find(".collection-grid-item__title").text().trim()
        );
        let link = `${categoriesBaseUrl}${
          $(category).find(".collection-grid-item__link")[0].attribs["href"]
        }`;
        return { name, link };
      })
      .toArray();

    const selectQuery = "SELECT * FROM categories";
    const categoriesInDB = await pool.query(selectQuery);

    if (categoriesInDB.rows.length === 0) {
      await insertInDB(
        "categories",
        ["category_name", "category_link"],
        categories,
        (item, col) => {
          const map = {
            category_name: item.name,
            category_link: item.link,
          };
          return map[col];
        }
      );
    } else {
      if (categoriesInDB.rows.length === categories.length) {
        console.log("No hay categorias nuevos que insertar");
      } else if (categoriesInDB.rows.length > categories.length) {
        const linksFromWeb = new Set(categories.map((p) => p.link));
        const categoriasAEliminar = categoriesInDB.rows.filter(
          (c) => !linksFromWeb.has(c.category_link)
        );

        for (const categoria of categoriasAEliminar) {
          await pool.query("DELETE FROM categories WHERE category_link = $1", [
            categoria.category_link,
          ]);
        }

        console.log(
          `Se eliminaron ${categoriasAEliminar.length} productos que ya no están en la web.`
        );
      } else if (categoriesInDB.rows.length < categories.length) {
        const linksFromDB = new Set(
          categoriesInDB.rows.map((c) => c.category_link)
        );
        const categoriesToInsert = categories.filter(
          (c) => !linksFromDB.has(c.link)
        );

        await insertInDB(
          "categories",
          ["category_name", "category_link"],
          categoriesToInsert,
          (item, col) => {
            const map = {
              category_name: item.name,
              category_link: item.link,
            };
            return map[col];
          }
        );
      }
    }
  } catch (error) {
    console.error("Error en webScrappingCategories:", error);
    throw error;
  }
}

async function relateProductsWithCategories() {
  try {
    const categories = await pool.query("SELECT * FROM categories");

    let finalProducts = [];

    for (let i = 0; i < categories.rows.length; i++) {
      const link = categories.rows[i]["category_link"];
      const id = categories.rows[i]["id"];
      const { data } = await axios.get(link);
      const $ = cheerio.load(data);

      const pagination = $(".pagination__text").text().trim();

      if (pagination) {
        const actualPage = pagination.split(" ")[1];
        const finalPage = pagination.split(" ")[3];

        for (let i = actualPage; i <= finalPage; i++) {
          const { data: pageData } = await axios.get(`${link}?page=${i}`);
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
              return { category_id: id, name, price, image, link };
            })
            .toArray();

          finalProducts.push(products);
        }
      } else {
        const { data: pageData } = await axios.get(link);
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
            return { category_id: id, name, price, image, link };
          })
          .toArray();

        finalProducts.push(products);
      }
    }
    finalProducts = finalProducts.flat();

    const productsInDB = await pool.query("SELECT * FROM products");

    const encontrados = encontrarCoincidenciasAgrupadas(
      productsInDB.rows,
      finalProducts
    );

    for (let i = 0; i < encontrados.length; i++) {
      for (let j = 0; j < encontrados[i].coincidencias.length; j++) {
        const insertQuery = `INSERT INTO product_categories VALUES (${encontrados[i].id}, ${encontrados[i].coincidencias[j].category_id}) `;
        await pool.query(insertQuery);
      }
    }
    console.log("Datos ingresados");
  } catch (error) {
    console.error("Error en relateProductsWithCategories:", error);
    throw error;
  }
}

function capitalize(text) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function encontrarCoincidenciasAgrupadas(lista1, lista2) {
  return lista1.map((producto) => {
    const nombreNormalizado = producto.product_name
      .toLowerCase()
      .replace(/[•·\-]/g, "")
      .trim();

    const coincidencias = lista2.filter((item2) => {
      const nombre2Normalizado = item2.name
        .toLowerCase()
        .replace(/[•·\-]/g, "")
        .trim();
      return nombre2Normalizado === nombreNormalizado;
    });

    return {
      id: producto.id,
      nombre: producto.product_name,
      coincidencias: coincidencias, // Si no hay coincidencias, será []
    };
  });
}

async function insertInDB(tableName, columns, items, valueMapper) {
  if (!Array.isArray(items) || items.length === 0) return;

  const values = [];
  const placeholders = items
    .map((item, i) => {
      const offset = i * columns.length;
      const valueGroup = columns.map((col, j) => {
        values.push(valueMapper(item, col));
        return `$${offset + j + 1}`;
      });
      return `(${valueGroup.join(", ")})`;
    })
    .join(", ");

  const insertQuery = `
    INSERT INTO ${tableName} (${columns.join(", ")})
    VALUES ${placeholders}
  `;

  await pool.query(insertQuery, values);
  console.log(
    `Se insertaron ${items.length} nuevos elementos en la tabla ${tableName}.`
  );
}

module.exports = {
  webScrappingProducts,
  webScrappingCatergories,
  relateProductsWithCategories,
};
