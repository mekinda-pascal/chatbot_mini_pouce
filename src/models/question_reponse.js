/* Authentification : Créer un modèle User avec Sequelize */
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Question_reponse", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Cette question existe déjà.",
      },
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Cette réponse existe déjà.",
      },
    },
  });
};
