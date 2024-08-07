const http = require("http");
const app = require("./app");

// Fonction pour normaliser le port, le convertit en entier ou retourne false si invalide
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val; // Retourne la valeur telle quelle si ce n'est pas un nombre
  }
  if (port >= 0) {
    return port; // Retourne le port si c'est un nombre positif
  }
  return false;
};
const port = normalizePort(process.env.PORT || "4000"); // Définit le port à partir de l'environnement ou par défaut à 4000
app.set("port", port); // Définit le port dans l'application express

// Fonction pour gérer les erreurs du serveur
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error; // Jette l'erreur si ce n'est pas une erreur de type "listen"
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges."); // Affiche une erreur si des privilèges élevés sont requis
      process.exit(1); // Quitte le processus avec un code d'échec
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use."); // Affiche une erreur si l'adresse est déjà utilisée
      process.exit(1); // Quitte le processus avec un code d'échec
      break;
    default:
      throw error; // Jette l'erreur pour les autres cas
  }
};

// Création du serveur HTTP avec l'application express
const server = http.createServer(app);

server.on("error", errorHandler); // Gestionnaire d'événements pour les erreurs
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind); // Affiche le port ou l'adresse écouté(e)
});

server.listen(port); // Le serveur écoute sur le port défini