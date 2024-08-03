const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

const upload = multer({ storage }).single('image');

const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        req.file.compressedFilename = req.file.filename.split('.')[0] + '.webp';
        req.file.compressedFilePath = './images/' + req.file.compressedFilename;

        await sharp(req.file.path)
            .resize(463, 595) 
            .webp({ quality: 90 }) 
            .toFile(req.file.compressedFilePath);

        fs.unlink(req.file.path, (error) => {
            if (error) console.log(error);
        });

        req.file.path = req.file.compressedFilePath;
        req.file.filename = req.file.compressedFilename;

        next();
    } catch (error) {
        res.status(403).json({ error });
    }
};

module.exports = { upload, optimizeImage };
