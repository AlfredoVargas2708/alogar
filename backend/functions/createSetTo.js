const { insertInDB } = require('../functions/insertInDB')

async function createSetTo(action, listWeb, listDB, table, column) {
  const linksFromWeb = new Set(listWeb.map((item) => item.link));
  const newList = listDB.rows.filter(
    (item) => !linksFromWeb.has(item.category_link)
  );

  if (action === "DELETE") {
    for (const item of newList) {
      await pool.query(
        `${action} FROM ${table} WHERE ${column} = ${item}.${column}`
      );
    }
    return;
  } else if (action === "INSERT" && table === "categories") {
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
  } else if (action === "INSERT" && table === "products") {
    await insertInDB(
      "products",
      ["product_name", "product_price", "product_link"],
      productsToInsert,
      (item, col) => {
        const map = {
          product_name: item.name,
          product_price: item.price,
          product_link: item.link,
        };
        return map[col];
      }
    );
  }
}

module.exports = { createSetTo }