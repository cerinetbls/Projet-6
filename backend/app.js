const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour gérer les en-têtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Middleware pour loguer les requêtes reçues
app.use((req, res, next) => {
    console.log('Requête reçue !');
    next();
});

// Middleware pour définir le statut de la réponse
app.use((req, res, next) => {
    res.status(201);
    next();
});

// Middleware pour envoyer une réponse JSON
app.use((req, res, next) => {
    res.json({ message: 'Votre requête a bien été reçue !' });
    next();
});

// Middleware pour loguer les réponses envoyées
app.use((req, res, next) => {
    console.log('Réponse envoyée avec succès !');
    next();  // Ajout de next() pour continuer la chaîne de middleware
});

// Connexion à MongoDB
mongoose.connect(
    "mongodb+srv://cerine_tbls:Trabelsi123@cluster0.lfdsenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(err => console.log('Connexion à MongoDB échouée :', err));

module.exports = app;
