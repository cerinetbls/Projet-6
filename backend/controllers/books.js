const Book = require("../models/Book");
const fs = require("fs");

exports.rateBook = (req, res, next) => {
  const userId = req.auth.userId; 

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.ratings.find(rating => rating.userId === userId)) {
        return res.status(403).json({ message: "Livre déjà noté." });
      } else {
        const newRating = {
          userId: userId,
          grade: req.body.rating
        };

        const updatedRatings = [...book.ratings, newRating];

        const calcAverageRating = (ratings) => {
          const sum = ratings.reduce((total, rate) => total + rate.grade, 0);
          const average = sum / ratings.length;
          return parseFloat(average.toFixed(2));
        }

        const updatedAverageRating = calcAverageRating(updatedRatings);

        Book.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { ratings: newRating }, averageRating: updatedAverageRating },
          { new: true }
        )
          .then(updatedBook => res.status(201).json(updatedBook))
          .catch(err => res.status(500).json({ err })); 
      }
    })
    .catch(err => res.status(500).json({ err })); 
  }
  exports.getAllBooks = (req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

  exports.getBestBooks = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 }) // Trie les livres par note moyenne décroissante.
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.createBook = (req, res, next) => {
  try {
    // Récupère les données du livre depuis le corps de la requête
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : null
    });

    if (!book.imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    book.save()
      .then(() => {
        res.status(201).json({ message: "Livre enregistré avec succès." });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id },
        )
          .then(() => res.status(200).json({ message: "Livre modifié." }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: "Non-autorisé" });
    } else {
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé." }))
          .catch((error) => res.status(401).json({ error }));
      });
    }
  });
};