const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup); // Route pour l'inscription des utilisateurs
router.post("/login", userCtrl.login); // Route pour la connexion des utilisateurs

module.exports = router;
