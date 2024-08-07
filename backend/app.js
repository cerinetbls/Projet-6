require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");


// Connexion à la base de données MongoDB avec les variables d'environnement
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.MONGO_DB}`,
  )
  .then(() => console.log("Connexion à MongoDB réussie !")) // Message de succès si la connexion fonctionne
  .catch(() => console.log("Connexion à MongoDB échouée !")); // Message d'erreur si la connexion échoue

const app = express(); // Création de l'application express

app.use(express.json()); // Utilise express.json() pour analyser les corps de requêtes JSON

// Configuration des en-têtes CORS pour permettre les requêtes depuis n'importe quelle origine
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next(); // Passe au middleware suivant
});

app.use(bodyParser.json()); // Utilise body-parser pour analyser les corps de requêtes JSON
app.use("/api/books", bookRoutes); // Route pour les livres
app.use("/api/auth", userRoutes); // Route pour l'authentification des utilisateurs
app.use("/images", express.static(path.join(__dirname, "images"))); // Route pour servir les images statiques

module.exports = app;