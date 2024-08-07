require('dotenv').config();

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Récupère le token JWT de l'en-tête Authorization
    const token = req.headers.authorization.split(" ")[1];
    // Vérifie et décode le token en utilisant la clé secrète
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Récupère l'ID de l'utilisateur à partir du token décodé
    const userId = decodedToken.userId;
    // Ajoute l'ID de l'utilisateur à l'objet req.auth pour l'utiliser dans les middleware suivants
    req.auth = {
      userId: userId,
    };
    next(); // Passe au middleware suivant
  } catch (error) {
    // Renvoie une erreur si la vérification du token échoue
    res.status(401).json({ error: 'Requête non authentifiée' });
  }
};