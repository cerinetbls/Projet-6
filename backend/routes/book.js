const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { upload, optimizeImage } = require("../middleware/multer-config");

const booksCtrl = require("../controllers/books");

router.get("/bestrating", booksCtrl.getBestBooks); // Route pour obtenir les meilleurs livres
router.get("/", booksCtrl.getAllBooks); // Route pour obtenir tous les livres
router.post("/", auth, upload, optimizeImage, booksCtrl.createBook); // Route pour créer un nouveau livre, avec authentification et gestion des images
router.get("/:id", booksCtrl.getOneBook); // Route pour obtenir un livre par ID
router.put("/:id", auth, upload, optimizeImage, booksCtrl.modifyBook); // Route pour modifier un livre, avec authentification et gestion des images
router.delete("/:id", auth, booksCtrl.deleteBook); // Route pour supprimer un livre, avec authentification
router.post("/:id/rating", auth, booksCtrl.rateBook); // Route pour noter un livre, avec authentification

module.exports = router;