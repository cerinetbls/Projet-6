const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

// Définition des types MIME et leurs extensions correspondantes
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp'
};

// Configuration du stockage des fichiers avec multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './images'); // Dossier de destination pour les fichiers uploadés
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_'); // Remplace les espaces par des underscores dans le nom de fichier
        const extension = MIME_TYPES[file.mimetype]; // Récupère l'extension correspondant au type MIME
        callback(null, name + Date.now() + '.' + extension); // Génère le nom de fichier unique
    }
});

// Middleware multer pour l'upload d'une seule image
const upload = multer({ storage }).single('image');

// Middleware pour optimiser l'image uploadée
const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next(); // Passe au middleware suivant si aucun fichier n'est uploadé
    }

    try {
        // Définir les noms de fichiers compressés
        req.file.compressedFilename = req.file.filename.split('.')[0] + '.webp';
        req.file.compressedFilePath = './images/' + req.file.compressedFilename;

        // Utilise sharp pour redimensionner et convertir l'image en WebP
        await sharp(req.file.path)
            .resize(463, 595) // Redimensionne l'image
            .webp({ quality: 90 }) // Convertit en WebP avec une qualité de 90
            .toFile(req.file.compressedFilePath); // Sauvegarde l'image optimisée

        // Supprime l'image originale
        fs.unlink(req.file.path, (error) => {
            if (error) console.log(error);
        });

        // Met à jour les chemins et noms de fichiers dans req.file
        req.file.path = req.file.compressedFilePath;
        req.file.filename = req.file.compressedFilename;

        next(); // Passe au middleware suivant
    } catch (error) {
        res.status(403).json({ error }); // Renvoie une erreur en cas de problème
    }
};

module.exports = { upload, optimizeImage };