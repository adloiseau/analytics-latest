// app.js (dans le dossier de ton app)
const express = require("express");
const path = require("path");

const app = express();
const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

// Pour les routes SPA comme /auth/callback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
