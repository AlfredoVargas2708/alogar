const axios = require("axios");
const cheerio = require("cheerio");

async function webScrapping() {
  axios.get("https://alogar.cl/collections/all").then(({ data }) => {
    const $ = cheerio.load(data);

    const products = $(".grid-view-item.product-card")
      .map((_, product) => {
        let name = capitalize(
          $(product).find(".product-card__title").text().trim()
        );
        let price = Number(
          $(product)
            .find(".price-item.price-item--regular")
            .text()
            .trim()
            .replace("$", "")
            .replace(".", "")
        );
        let image = `https:${$(product)
          .find("img")[0]
          .attribs["data-src"].replace("{width}", "180")}`;
        let link = `https://alogar.cl:${
          $(product).find(".grid-view-item__link")[0].attribs["href"]
        }`;
        return {
          name,
          price,
          image,
          link,
        };
      })
      .toArray();
  });
}

function capitalize(text) {
  if (typeof text !== "string" || text.length === 0) {
    return text; // Manejar casos especiales
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

webScrapping();
