const mongoose = require("mongoose");

// Définition du schéma de livre avec mongoose
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true }, // ID de l'utilisateur ayant créé le livre
  title: { type: String, required: true }, // Titre du livre
  author: { type: String, required: true }, // Auteur du livre
  imageUrl: { type: String, required: true }, // URL de l'image du livre
  year: { type: Number, required: true }, // Année de publication du livre
  genre: { type: String, required: true }, // Genre du livre
  ratings: [
    {
      userId: { type: String, required: true }, // ID de l'utilisateur ayant noté le livre
      grade: { type: Number, required: true, min: 0, max: 5 }, // Note attribuée au livre
    },
  ],
  averageRating: { type: Number, default: 0 }, // Note moyenne du livre, par défaut 0
});

module.exports = mongoose.model("Book", bookSchema);

