import axios from "axios";
import * as cheerio from "cheerio"; // Importar todo el namespace

export async function getDataWeb(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data); // Usar cheerio.load()

  return $;
}
