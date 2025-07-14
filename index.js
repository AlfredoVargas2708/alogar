// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const apiRoute = require("./routes/index");
const { webScrapping } = require("./web/scrapping");

// Middlewares deben ir antes de las rutas
app.use(cors());
app.use(express.json());
app.use("/api", apiRoute);

// Manejo mejorado del web scraping
setTimeout(async () => {
  try {
    await webScrapping();
  } catch (error) {
    console.error("Error en web scraping:", error);
  }
}, 1000);

app.listen(PORT, () => {
  console.log("Server running in http://localhost:3000");
});