// router.js — Routeur SPA (Single Page Application)
// Ce fichier gère la navigation entre les pages sans rechargement.
// Il utilise le "hash" de l'URL :
//   #/login    → affiche la page de connexion
//   #/contacts → affiche la page des contacts (si connecté)


// On importe la fonction qui vérifie si un utilisateur est connecté
import { estConnecte } from "./services/authServices.js";

// On récupère les deux "pages" dans le HTML
const pageLogin    = document.getElementById("page-login");    // page de connexion
const pageContacts = document.getElementById("page-contacts"); // page des contacts

// Cache une page et affiche l'autre
// route : "login" ou "contacts"
function afficher(route) {
    // Si route = "login"    → pageLogin visible    (hidden = false),  pageContacts masquée (hidden = true)
    // Si route = "contacts" → pageContacts visible (hidden = false),  pageLogin masquée    (hidden = true)
    pageLogin.hidden    = route !== "login";
    pageContacts.hidden = route !== "contacts";
}

// Change la page en modifiant le hash dans l'URL du navigateur
// Exemple : naviguer("contacts") 
// Ce changement de hash déclenche automatiquement l'événement "hashchange"
export function naviguer(route) {
    window.location.hash = "/" + route;
}

// Analyse l'URL actuelle et décide quelle page montrer
function gererRoute() {
    // Lit le hash de l'URL (ex: "#/contacts") et supprime le "#/" du début
    // Si l'URL n'a pas de hash (première visite), on considère qu'on est sur "login"
    const hash = window.location.hash.replace(/^#\/?/, "") || "login";

    // Sécurité : si on essaie d'accéder à "contacts" sans être connecté
    //  on redirige automatiquement vers "login"
    if (hash === "contacts" && !estConnecte()) {
        naviguer("login"); // change le hash  déclenche hashchange → gererRoute() se relance
        return;            // arrête l'exécution de la fonction ici
    }

    // Confort : si on est déjà connecté et qu'on essaie d'aller sur "login"
    //  on redirige directement vers "contacts"
    if (hash === "login" && estConnecte()) {
        naviguer("contacts");
        return;
    }

    // Affiche la bonne page selon la route détectée
    afficher(hash === "contacts" ? "contacts" : "login");
}

// Démarre le routeur (à appeler une seule fois au chargement dans app.js)
export function initRouter() {
    // Écoute chaque changement du hash dans l'URL
    // (se déclenche à chaque appel de naviguer() ou clic sur un lien #…)
    window.addEventListener("hashchange", gererRoute);

    // Appelle gererRoute() immédiatement pour afficher la bonne page dès le démarrage
    gererRoute();
}
