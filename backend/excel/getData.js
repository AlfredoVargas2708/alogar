const XLSX = require("xlsx");
const { pool } = require("../db/config");
const { encontrarCoincidenciasAgrupadas } = require("../web/scrapping");

async function insertExcelData(path) {
  try {
    const workbook = XLSX.readFile(path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const dbData = await pool.query("SELECT * FROM products");

    const coincidencias = encontrarCoincidenciasAgrupadas(
      dbData.rows,
      data
    ).filter((producto) => producto.coincidencias.length > 0);

    for (let i = 0; i < coincidencias.length; i++) {
      const productCode = coincidencias[i].coincidencias.map(
        (coincidencia) => coincidencia.codigobarra
      )[0];
      const productId = coincidencias[i].id;
      const productWeighable =
        coincidencias[i].coincidencias.map(
          (coincidencia) => coincidencia.pesable
        )[0] === "Si"
          ? true
          : false;

      const updateQuery = `UPDATE products SET product_code = ${productCode}, product_weighable = ${productWeighable} WHERE id = ${productId}`;
      await pool.query(updateQuery);
    }

    console.log('Productos actualizados')
  } catch (error) {
    console.error("Error in dataExcel:", error);
    throw error;
  }
}

module.exports = { insertExcelData };
