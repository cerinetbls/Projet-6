require('dotenv').config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Inscription
exports.signup = (req, res, next) => {
  // Hash le mot de passe fourni avec un coût de 10
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Crée un nouvel utilisateur avec l'email et le mot de passe hashé
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // Sauvegarde l'utilisateur dans la base de données
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" })) // Renvoie un message de succès
        .catch((error) => res.status(400).json({ error: "Erreur lors de la création de l'utilisateur" })); // Renvoie une erreur en cas de problème
    })
    .catch((error) => res.status(500).json({ error: "Erreur interne du serveur" })); // Renvoie une erreur en cas de problème avec le hachage
};

// Connexion
exports.login = (req, res, next) => {
  // Cherche l'utilisateur par email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Paire identifiant/mot de passe incorrecte" }); // Renvoie une erreur si l'utilisateur n'existe pas
      }
      // Compare le mot de passe fourni avec le mot de passe hashé stocké
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Paire identifiant/mot de passe incorrecte" }); // Renvoie une erreur si le mot de passe est incorrect
          }
          // Génère un token JWT et renvoie l'ID de l'utilisateur et le token
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id }, // Données à inclure dans le token
              process.env.JWT_SECRET, // Clé secrète pour signer le token
              { expiresIn: "24h" } // Durée de validité du token
            ),
          });
        })
        .catch((error) => res.status(500).json({ error: "Erreur interne du serveur" })); // Renvoie une erreur en cas de problème avec la comparaison
    })
    .catch((error) => res.status(500).json({ error: "Erreur interne du serveur" })); // Renvoie une erreur en cas de problème avec la recherche de l'utilisateur
};