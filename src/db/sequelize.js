/* L’API Rest et la Base de données : Créer un modèle Sequelize */
const { Sequelize, DataTypes } = require("sequelize");
const QuestionReponseModel = require("../models/question_reponse");
const listQuestionsReponses = require("./responses.json");

const sequelize = new Sequelize("chatbot", "root", "", {
  host: "localhost",
  dialect: "mariadb",
  dialectOptions: { timezone: "Etc/GMT-2" },
  logging: false,
});

const Question_reponse = QuestionReponseModel(sequelize, DataTypes);

const initDb = () => {
  return sequelize.sync({ force: true }).then((_) => {
    listQuestionsReponses.map((objQuestion) => {
      console.log("objQuestion: ", objQuestion);
      Question_reponse.create({
        question: objQuestion?.question,
        answer: objQuestion?.answer,
      })
        .then(
          (objQuestion) => console.log("initDb")
          // console.log(objQuestion.toJSON())
        )
        .catch((error) => {
          console.error(
            "Erreur lors de la création de l'enregistrement:",
            error
          );
        });
    });

    console.log("La base de donnée a bien été initialisée !");
  });
};

module.exports = {
  initDb,
  Question_reponse,
};
