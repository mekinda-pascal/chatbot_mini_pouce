const { Question_reponse } = require("../db/sequelize");
const fs = require("fs");
// Pour le NLP (Natural Language Processing)
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const metaphone = natural.Metaphone;
const logger = require("../config/winston-config");

// Nouvelle méthode avec NLP
module.exports = (app) => {
  app.post("/webhook", async (req, res) => {
    try {
      if (req?.body && req?.body?.message) {
        const userMessage = req.body.message;
        logger.info(`Nouvelle requête reçue avec le message: ${userMessage}`);

        let botResponse =
          "Veuillez reformuler, je n'ai pas bien compris votre question s'il vous plaît.";

        // Utilisez Sequelize pour récupérer les questions-réponses depuis la base de données
        const dbResponses = await Question_reponse.findAll();

        dbResponses.forEach((response) => {
          if (response?.question) {
            const metaphoneUserQuestion = metaphone.process(
              userMessage.toLowerCase()
            );
            const metaphoneResponseQuestion = metaphone.process(
              response.question.toLowerCase()
            );

            const userTokens = tokenizer.tokenize(metaphoneUserQuestion);
            const responseTokens = tokenizer.tokenize(
              metaphoneResponseQuestion
            );

            // Calcul du Jaccard Index
            const intersection = new Set(
              userTokens.filter((token) => responseTokens.includes(token))
            );
            const union = new Set([...userTokens, ...responseTokens]);
            const similarity = intersection.size / union.size;

            // Ajustez le seuil de similarité selon vos besoins
            const similarityThreshold = 0.4; // Modifié pour être plus tolérant

            if (similarity >= similarityThreshold) {
              botResponse = response.answer;
              // Sortir de la boucle si une correspondance est trouvée
              return;
            }
          }
        });

        // Si le chatbot ne trouve pas de correspondance étroite, apprendre
        if (
          botResponse ===
          "Veuillez reformuler, je n'ai pas bien compris votre question s'il vous plaît."
        ) {
          // Ajouter une nouvelle réponse
          const newUserResponse = {
            question: userMessage,
            answer: "Nouvelle réponse à apprendre.",
          };
          // Enregistrez également cette nouvelle réponse dans la base de données
          await Question_reponse.create(newUserResponse);

          logger.info(
            `Nouvelle réponse apprise et ajoutée à la base de données.`
          );
        }

        res.json({ message: botResponse });
      } else {
        res.status(400).json({
          error: "Le champ 'message' est manquant dans le corps de la requête.",
        });
      }
    } catch (error) {
      logger.error(
        `Erreur lors de la manipulation des questions-réponses depuis la base de données: ${error}`
      );
      res.status(500).json({
        error:
          "Une erreur s'est produite lors de la récupération ou de l'ajout des questions-réponses depuis la base de données.",
      });
    }
  });
};
