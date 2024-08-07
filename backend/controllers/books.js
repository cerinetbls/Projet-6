const Book = require("../models/Book"); 
const fs = require("fs"); 

// Fonction pour évaluer un livre
exports.rateBook = (req, res, next) => {
  const userId = req.auth.userId; // Récupère l'ID de l'utilisateur authentifié

  Book.findOne({ _id: req.params.id }) // Cherche le livre par ID
    .then(book => {
      // Vérifie si l'utilisateur a déjà noté ce livre
      if (book.ratings.find(rating => rating.userId === userId)) {
        return res.status(403).json({ message: "Livre déjà noté." }); // Renvoie une erreur si le livre est déjà noté
      } else {
        // Crée une nouvelle note
        const newRating = {
          userId: userId,
          grade: req.body.rating
        };

        // Met à jour les notes du livre
        const updatedRatings = [...book.ratings, newRating];

        // Calcule la note moyenne des notes
        const calcAverageRating = (ratings) => {
          const sum = ratings.reduce((total, rate) => total + rate.grade, 0);
          const average = sum / ratings.length;
          return parseFloat(average.toFixed(2));
        }

        // Calcule la nouvelle note moyenne
        const updatedAverageRating = calcAverageRating(updatedRatings);

        // Met à jour le livre avec la nouvelle note et la nouvelle note moyenne
        Book.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { ratings: newRating }, averageRating: updatedAverageRating },
          { new: true }
        )
          .then(updatedBook => res.status(201).json(updatedBook)) // Renvoie le livre mis à jour
          .catch(err => res.status(500).json({ err })); // Renvoie une erreur en cas de problème
      }
    })
    .catch(err => res.status(500).json({ err })); // Renvoie une erreur en cas de problème
}

// Fonction pour obtenir tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books); // Renvoie tous les livres
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// Fonction pour obtenir les meilleurs livres
exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trie les livres par note moyenne décroissante.
    .limit(3) // Limite les résultats aux 3 meilleurs livres
    .then((books) => {
      res.status(200).json(books); // Renvoie les meilleurs livres
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour obtenir un seul livre par ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book)) // Renvoie le livre trouvé
    .catch((error) => res.status(404).json({ error })); // Renvoie une erreur si le livre n'est pas trouvé
};

// Fonction pour créer un nouveau livre
exports.createBook = (req, res, next) => {
  try {
    // Récupère les données du livre depuis le corps de la requête
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    // Crée un nouvel objet Book avec les données fournies
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId, // Ajoute l'ID de l'utilisateur authentifié
      // Ajoute l'URL de l'image si un fichier est fourni, sinon met l'URL à null
      imageUrl: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : null
    });

    // Vérifie si l'URL de l'image est présente, sinon renvoie une erreur
    if (!book.imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' }); // Renvoie une erreur si l'URL de l'image est manquante
    }

    book.save()
      .then(() => {
        res.status(201).json({ message: "Livre enregistré avec succès." }); // Renvoie un message de succès
      })
      .catch((error) => {
        res.status(400).json({ error }); 
      });
  } catch (error) {
    res.status(500).json({ error: error.message }); // Renvoie une erreur en cas de problème
  }
};

// Fonction pour modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Si une nouvelle image est envoyée, ajoute son URL
        // Sinon, utilise seulement les données du livre fournies
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" }); // Renvoie une erreur si l'utilisateur n'est pas autorisé
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id },
        )
          .then(() => res.status(200).json({ message: "Livre modifié." })) // Renvoie un message de succès
          .catch((error) => res.status(401).json({ error })); // Renvoie une erreur en cas de problème
      }
    })
    .catch((error) => {
      res.status(400).json({ error }); // Renvoie une erreur en cas de problème
    });
};

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: "Non-autorisé" }); // Renvoie une erreur si l'utilisateur n'est pas autorisé
    } else {
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé." })) // Renvoie un message de succès
          .catch((error) => res.status(401).json({ error })); // Renvoie une erreur en cas de problème
      });
    }
  });
};
