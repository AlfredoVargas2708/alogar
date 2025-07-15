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

module.exports = { insertInDB }