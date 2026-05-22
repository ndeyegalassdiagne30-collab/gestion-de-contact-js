//  userStores.js  —  Communication avec le serveur JSON pour les utilisateurs
//  Ce fichier sert uniquement à récupérer les utilisateurs
//  afin de vérifier les identifiants lors de la connexion.


// Adresse du serveur JSON Server pour la ressource "users"
const BASE_URL = "http://localhost:3000/users";

//  Récupère la liste de tous les utilisateurs depuis le serveur (requête GET)
export async function recupererLesUtilisateurs() {
    try {
        // Envoie une requête GET au serveur
        const res = await fetch(BASE_URL);

        // Si le serveur répond avec une erreur, on retourne un tableau vide
        if (!res.ok) return [];

        // Convertit la réponse JSON en tableau JavaScript et le retourne
        return await res.json();
    } catch {
        // Si le serveur est éteint ou inaccessible, on retourne un tableau vide
        return [];
    }
}
