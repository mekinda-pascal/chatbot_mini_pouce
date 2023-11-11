const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;
const fs = require("fs");
//Pour le NLP (Natural Language Processing)
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const metaphone = natural.Metaphone;

// Activer le middleware CORS
app.use(bodyParser.json()).use(cors());

app.get("/message", (req, res) => {
  res.json({ message: "Ceci est un message de votre API Node.js du chatbot." });
});

// Créez des routes pour gérer les conversations avec le chatbot
// app.post("/webhook", (req, res) => {
//   if (req.body && req.body.message) {
//     const userMessage = req.body.message;
//     console.log("userMessage: ", userMessage);

//     // Lisez le fichier JSON de réponses
//     const responsesJson = fs.readFileSync("responses.json", "utf8");
//     const responses = JSON.parse(responsesJson);
//     // console.log("responses: ", responses);

//     // Recherchez la question dans les réponses
//     let botResponse = "Réponse du chatbot par défaut";

//     //Ancienne methode
//     //   for (const response of responses.responses) {
//     //     if (userMessage.toLowerCase() === response.question.toLowerCase()) {
//     //       botResponse = response.answer;
//     //       break;
//     //     }
//     //   }

//     // Nouvelle méthode
//     for (const response of responses.responses) {
//       if (response && response.question) {
//         // Transformez les questions en minuscules et enlevez les espaces
//         const userQuestion = userMessage.toLowerCase().replace(/\s/g, "");
//         const responseQuestion = response.question
//           .toLowerCase()
//           .replace(/\s/g, "");

//         // Vérifiez si la question de l'utilisateur contient la question de réponse
//         if (userQuestion.includes(responseQuestion)) {
//           botResponse = response.answer;
//           break;
//         }
//       }
//     }

//     res.json({ message: botResponse });
//   } else {
//     res.status(400).json({
//       error: "Le champ 'message' est manquant dans le corps de la requête.",
//     });
//   }
// });

// Nouvelle méthode avec NLP
app.post("/webhook", (req, res) => {
  if (req.body && req.body.message) {
    const userMessage = req.body.message;
    console.log("userMessage: ", userMessage);

    const responsesJson = fs.readFileSync("responses.json", "utf8");
    const responses = JSON.parse(responsesJson);

    let botResponse =
      "Veuillez reformuler, je n'ai pas bien compris votre question s'il vous plaît.";

    for (const response of responses.responses) {
      if (response && response.question) {
        const metaphoneUserQuestion = metaphone.process(
          userMessage.toLowerCase()
        );
        const metaphoneResponseQuestion = metaphone.process(
          response.question.toLowerCase()
        );

        const userTokens = tokenizer.tokenize(metaphoneUserQuestion);
        const responseTokens = tokenizer.tokenize(metaphoneResponseQuestion);

        // Calcul du Jaccard Index
        const intersection = new Set(
          userTokens.filter((token) => responseTokens.includes(token))
        );
        const union = new Set([...userTokens, ...responseTokens]);
        const similarity = intersection.size / union.size;

        // Ajustez le seuil de similarité selon vos besoins
        const similarityThreshold = 0.6;

        if (similarity >= similarityThreshold) {
          botResponse = response.answer;
          break;
        }
      }
    }

    res.json({ message: botResponse });
  } else {
    res.status(400).json({
      error: "Le champ 'message' est manquant dans le corps de la requête.",
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur Node.js écoutant sur le port ${port}`);
});
