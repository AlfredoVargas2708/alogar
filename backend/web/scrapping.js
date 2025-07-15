// web/scrapping.js
const { pool } = require("../db/config");
const { createSetTo } = require("../functions/createSetTo.js");
const { getDataWeb } = require("../functions/getDataWeb");
const { paginationWeb } = require("../functions/paginationInWeb");
const { insertInDB } = require('../functions/insertInDB.js')
const productsBaseUrl = "https://alogar.cl/collections/all";
const categoriesBaseUrl = "https://alogar.cl";

async function webScrappingProducts() {
  try {
    const $ = await getDataWeb(productsBaseUrl);

    const pagination = await paginationWeb($);

    let finalProducts = [];

    for (let i = pagination.actualPage; i <= pagination.finalPage; i++) {
      const $ = await getDataWeb(`${productsBaseUrl}?page=${i}`);

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
          const link = `https://alogar.cl${
            $(product).find(".grid-view-item__link")[0].attribs["href"]
          }`;
          return { name, price, link };
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
        ["product_name", "product_price", "product_link"],
        finalProducts,
        (item, col) => {
          const map = {
            product_name: item.name,
            product_price: item.price,
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
        await createSetTo(
          "DELETE",
          finalProducts,
          productsInDB,
          "products",
          "product_link"
        );
      } else if (productsInDB.rows.length < finalProducts.length) {
        await createSetTo(
          "INSERT",
          finalProducts,
          productsInDB,
          "products",
          "product_link"
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
    const $ = await getDataWeb(categoriesBaseUrl);

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
        await createSetTo(
          "DELETE",
          categories,
          categoriesInDB,
          "categories",
          "category_link"
        );
      } else if (categoriesInDB.rows.length < categories.length) {
        await createSetTo(
          "INSERT",
          categoriesInDB,
          categories,
          "categories",
          "category_link"
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
      const $ = await getDataWeb(link);

      const pagination = await paginationWeb($);

      if (pagination.pagination) {
        for (let i = pagination.actualPage; i <= pagination.finalPage; i++) {
          const $ = await getDataWeb(`${link}?page=${i}`);

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
              const link = `https://alogar.cl${
                $(product).find(".grid-view-item__link")[0].attribs["href"]
              }`;
              return { category_id: id, name, price, link };
            })
            .toArray();

          finalProducts.push(products);
        }
      } else {
        const $ = await getDataWeb(link);

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
            const link = `https://alogar.cl${
              $(product).find(".grid-view-item__link")[0].attribs["href"]
            }`;
            return { category_id: id, name, price, link };
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

module.exports = {
  webScrappingProducts,
  webScrappingCatergories,
  relateProductsWithCategories,
  encontrarCoincidenciasAgrupadas,
};
