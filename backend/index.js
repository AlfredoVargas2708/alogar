const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const apiRoute = require("./routes/index");
const {
  webScrappingProducts,
  webScrappingCatergories,
} = require("./web/scrapping");

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api", apiRoute);

// Scraping cada 10 minutos de forma segura
async function scheduleScraping() {
  try {
    await webScrappingProducts();
    await webScrappingCatergories();
  } catch (err) {
    console.error("Scraping falló:", err);
  } finally {
    setTimeout(scheduleScraping, 3600000); // espera 1 hora antes de volver a ejecutar
  }
}

scheduleScraping();

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
