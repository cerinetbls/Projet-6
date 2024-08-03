const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { upload, optimizeImage } = require("../middleware/multer-config");

const booksCtrl = require("../controllers/books");

router.get("/", booksCtrl.getAllBooks);
router.post("/", auth, upload, optimizeImage, booksCtrl.createBook);
router.get("/:id", auth, booksCtrl.getOneBook);
router.put("/:id", auth, upload, optimizeImage, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);
router.post("/:id/rating", auth, booksCtrl.rateBook); 
router.get("/bestrating", booksCtrl.getBestBooks); 

module.exports = router;