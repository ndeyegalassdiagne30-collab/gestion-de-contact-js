// loginRenderer.js — Formulaire de connexion et bouton de déconnexion
// Ce fichier écoute les actions de l'utilisateur sur la page de connexion
// et appelle les fonctions appropriées pour connecter ou déconnecter.


// On importe les fonctions d'authentification depuis authServices
import { seConnecter, seDeconnecter, getUtilisateurConnecte } from "../services/authServices.js";

// On importe la fonction pour afficher des notifications
import { showToast } from "./messageRenderer.js";

// On importe la fonction de navigation entre les pages
import { naviguer } from "../router.js";

// Récupère le formulaire de connexion (contient les champs email et mot de passe)
const loginForm       = document.getElementById("loginForm");

// Récupère le champ email du formulaire de connexion
const loginEmailEl    = document.getElementById("loginEmail");

// Récupère le champ mot de passe du formulaire de connexion
const loginPasswordEl = document.getElementById("loginPassword");

// Récupère la zone d'erreur sous le champ email
const errEmail        = document.getElementById("err-loginEmail");

// Récupère la zone d'erreur sous le champ mot de passe
const errPassword     = document.getElementById("err-loginPassword");

// Récupère le bouton "Déconnexion" dans la page contacts
const logoutBtn       = document.getElementById("logoutBtn");

// Récupère la zone où afficher le nom de l'utilisateur connecté
const userNameEl      = document.getElementById("userName");

// Affiche "Prénom Nom" dans la barre de déconnexion de la page contacts
function afficherNomUtilisateur() {
    // Récupère les infos de l'utilisateur actuellement connecté (depuis sessionStorage)
    const user = getUtilisateurConnecte();

    // Si un utilisateur est connecté ET que l'élément HTML existe bien
    if (user && userNameEl) {
        // Affiche son prénom et son nom dans l'interface
        userNameEl.textContent = `${user.prenom} ${user.nom}`;
    }
}

// Efface les messages d'erreur du formulaire de connexion
function effacerErreurs() {
    errEmail.textContent     = "";                          // supprime le texte d'erreur sous l'email
    errPassword.textContent  = "";                          // supprime le texte d'erreur sous le mot de passe
    loginEmailEl.classList.remove("invalid");               // retire la bordure rouge du champ email
    loginPasswordEl.classList.remove("invalid");            // retire la bordure rouge du champ mot de passe
}

// Initialise tous les événements liés à la connexion / déconnexion
// Cette fonction est appelée une seule fois au démarrage dans app.js
export function initLogin() {

        // Écoute la soumission du formulaire de connexion
    loginForm.addEventListener("submit", async (e) => {
        // Empêche le comportement par défaut du formulaire (qui rechargerait la page)
        e.preventDefault();

        // Efface les messages d'erreur affichés lors d'une tentative précédente
        effacerErreurs();

        // Lit la valeur du champ email et supprime les espaces en début/fin
        const email    = loginEmailEl.value.trim();

        // Lit la valeur du champ mot de passe (sans trim car les espaces peuvent être voulus)
        const password = loginPasswordEl.value;

        // Validation : vérifie que l'email n'est pas vide
        if (!email) {
            errEmail.textContent = "L'email est requis.";   // affiche le message d'erreur
            loginEmailEl.classList.add("invalid");           // met le champ en rouge
            loginEmailEl.focus();                            // place le curseur sur ce champ
            return;                                          // arrête la fonction, ne continue pas
        }

        // Validation : vérifie que le mot de passe n'est pas vide
        if (!password) {
            errPassword.textContent = "Le mot de passe est requis.";
            loginPasswordEl.classList.add("invalid");
            loginPasswordEl.focus();
            return;
        }

        // Envoie l'email et le mot de passe au serveur pour vérification
        // "await" = on attend la réponse avant de continuer
        const user = await seConnecter(email, password);

        // Si seConnecter retourne null, les identifiants sont incorrects
        if (!user) {
            errPassword.textContent = "Email ou mot de passe incorrect.";
            loginPasswordEl.classList.add("invalid");                     // met le champ en rouge
            showToast("danger", "Connexion refusée", "Vérifiez vos identifiants.");
            return;
        }

        // Connexion réussie : affiche une notification de bienvenue
        showToast("success", "Connecté !", `Bienvenue, ${user.prenom} ${user.nom} !`);

        // Vide les champs du formulaire pour ne pas laisser les données visibles
        loginForm.reset();

        // Met à jour le nom affiché dans la barre de déconnexion
        afficherNomUtilisateur();

        // Redirige l'utilisateur vers la page des contacts
        naviguer("contacts");
    });

    // Écoute le clic sur le bouton "Déconnexion" dans la page contacts
    logoutBtn.addEventListener("click", () => {
        // Supprime la session → l'utilisateur n'est plus reconnu comme connecté
        seDeconnecter();

        // Affiche une notification de déconnexion
        showToast("warn", "Déconnexion", "Vous êtes maintenant déconnecté.");

        // Redirige vers la page de connexion
        naviguer("login");
    });

    // Met à jour le nom de l'utilisateur à chaque changement de page (hash)
    window.addEventListener("hashchange", afficherNomUtilisateur);

    // Affiche le nom dès le chargement si l'utilisateur était déjà connecté
    // (cas d'un rechargement de page avec session encore active)
    afficherNomUtilisateur();
}
