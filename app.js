const express = require("express");
const sequelize = require("./src/db/sequelize");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const port = 3000;

// Activer le middleware CORS
app.use(morgan("dev")).use(bodyParser.json()).use(cors());

//A décommenter pour initialiser la bd
// sequelize.initDb();

app.get("/message", (req, res) => {
  res.json({ message: "Ceci est un message de votre API Node.js du chatbot." });
});

// Ici nous placerons nos futur points de terminaison.
require("./src/routes/webhook")(app);
require("./src/routes/findAllAnswer")(app);

app.listen(port, () => {
  console.log(`Serveur Node.js écoutant sur le port ${port}`);
});
