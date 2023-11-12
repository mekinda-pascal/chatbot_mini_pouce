const { Question_reponse } = require("../db/sequelize");

module.exports = (app) => {
  app.get("/api/listQuestions", (req, res) => {
    Question_reponse.findAll()
      .then((obj) => {
        const code = 200;

        const message =
          "La liste des questions / réponses a bien été récupérée.";
        res.json({
          message,
          data: obj,
          code,
        });
      })
      .catch((error) => {
        console.log("8");
        const message =
          "La liste des questions / réponses n'a pas pu être trouvée.";
        res.status(500).json({ message, data: error });
      });
  });
};
