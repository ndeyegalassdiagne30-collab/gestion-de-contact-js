//Gestion de la connexion et de la session utilisateur
//  Ce fichier s'occupe de :
//    - vérifier l'email et le mot de passe
//    - mémoriser l'utilisateur connecté (session)
//    - savoir si quelqu'un est connecté
//    - déconnecter l'utilisateur

// On importe la fonction qui va chercher les utilisateurs sur le serveur
import { recupererLesUtilisateurs } from "../stores/userStores.js";

// Nom de la clé pour stocker la session dans sessionStorage
// sessionStorage = mémoire du navigateur qui s'efface à la fermeture de l'onglet
const CLE_SESSION = "contactsUser";

// Retourne l'utilisateur connecté, ou null s'il n'y en a pas
export function getUtilisateurConnecte() {
    // Lit la valeur enregistrée sous la clé "contactsUser" dans la mémoire du navigateur
    const data = sessionStorage.getItem(CLE_SESSION);

    // Si une valeur existe, on la convertit de texte JSON en objet JavaScript
    // Sinon on retourne null (personne n'est connecté)
    return data ? JSON.parse(data) : null;
}

//  Retourne true si un utilisateur est connecté, false sinon
export function estConnecte() {
    // On vérifie simplement que getUtilisateurConnecte() ne retourne pas null
    return getUtilisateurConnecte() !== null;
}

// Déconnecte l'utilisateur en supprimant sa session du navigateur
export function seDeconnecter() {
    // Supprime la session enregistrée l'utilisateur n'est plus reconnu
    sessionStorage.removeItem(CLE_SESSION);
}

//  Vérifie l'email et le mot de passe, puis crée une session si c'est correct
// Retourne les infos de l'utilisateur si succès, ou null si les identifiants sont faux
export async function seConnecter(email, motDePasse) {
    // Récupère la liste complète des utilisateurs depuis le serveur
    const users = await recupererLesUtilisateurs();

    // Cherche dans la liste un utilisateur dont l'email ET le mot de passe correspondent
    const user = users.find(
        (u) =>
            u.email === email.trim().toLowerCase() && // on ignore les espaces et les majuscules dans l'email
            u.password === motDePasse                 // on compare le mot de passe tel quel
    );

    // Si aucun utilisateur ne correspond, on retourne null (connexion refusée)
    if (!user) return null;

    // On prépare les données à mémoriser (on n'enregistre PAS le mot de passe)
    const session = {
        id: user.id,         // identifiant unique de l'utilisateur
        prenom: user.prenom, // prénom à afficher dans l'interface
        nom: user.nom,       // nom à afficher dans l'interface
        email: user.email,   // email de l'utilisateur
    };

    // On sauvegarde la session dans le navigateur en la convertissant en texte JSON
    sessionStorage.setItem(CLE_SESSION, JSON.stringify(session));

    // On retourne les infos de l'utilisateur pour les utiliser dans loginRenderer
    return session;
}
