export async function paginationWeb($) {
  const pagination = $(".pagination__text").text().trim();

  const actualPage = pagination.split(" ")[1];
  const finalPage = pagination.split(" ")[3];

  return { pagination, actualPage, finalPage }
}
