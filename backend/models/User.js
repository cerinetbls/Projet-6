const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Définition du schéma d'utilisateur avec mongoose
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Email de l'utilisateur, unique et requis
  password: { type: String, required: true }, // Mot de passe de l'utilisateur, requis
});

// Application du plugin uniqueValidator au schéma userSchema pour valider l'unicité des emails
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);