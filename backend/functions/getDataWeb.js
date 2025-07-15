const axios = require("axios");
const cheerio = require("cheerio");

async function getDataWeb(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  return $
}

module.exports = { getDataWeb }
