const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const apiRoute = require("./routes/index");
const { webScrapping } = require("./web/scrapping");

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api", apiRoute);

// Scraping cada 10 minutos de forma segura
async function scheduleScraping() {
  try {
    await webScrapping();
  } catch (err) {
    console.error("Scraping falló:", err);
  } finally {
    setTimeout(scheduleScraping, 600000); // espera 10 min antes de volver a ejecutar
  }
}

scheduleScraping();

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});