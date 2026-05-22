//  contactStores.js  —  Communication avec le serveur JSON pour les contacts
//  Ce fichier contient toutes les requêtes HTTP (GET, POST, PUT, DELETE).
//  Il ne fait QUE parler au serveur, sans toucher à l'affichage.

// Adresse du serveur JSON Server pour la ressource "contacts"
const URL_CONTACTS = "http://localhost:3000/contacts";

//  Récupère TOUS les contacts depuis le serveur (requête GET)
export async function recupererLesContactsDuServeur() {
    try {
        // Envoie une requête GET à l'adresse du serveur
        const reponse = await fetch(URL_CONTACTS);

        // Si le serveur répond avec une erreur , on retourne []
        if (!reponse.ok) {
            return [];
        }

        // Convertit la réponse (texte JSON) en tableau d'objets JavaScript
        const donnees = await reponse.json();

        // Vérifie que c'est bien un tableau avant de le retourner
        return Array.isArray(donnees) ? donnees : [];
    } catch {
        // Si le serveur est éteint ou qu'il y a un problème réseau, on retourne []
        return [];
    }
}

// Ajoute un nouveau contact sur le serveur (requête POST)
export async function ajouterSurLeServeur(contactSansId) {
    try {
        const reponse = await fetch(URL_CONTACTS, {
            method: "POST",                                   // POST = créer une nouvelle ressource
            headers: { "Content-Type": "application/json" }, // on informe le serveur qu'on envoie du JSON
            body: JSON.stringify(contactSansId),              // on transforme l'objet JS en texte JSON pour l'envoi
        });

        // Retourne true si l'ajout a réussi, false sinon
        return reponse.ok;
    } catch {
        // En cas d'erreur réseau, on signale l'échec
        return false;
    }
}

//  Met à jour un contact existant sur le serveur (requête PUT)
export async function modifierSurLeServeur(id, contact) {
    try {
        // On ajoute l'id dans l'URL pour cibler exactement le bon contact
    
        const reponse = await fetch(`${URL_CONTACTS}/${id}`, {
            method: "PUT",                                    // PUT = remplacer complètement une ressource
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contact),                    // le contact avec les nouvelles valeurs
        });

        // Retourne true si la modification a réussi, false sinon
        return reponse.ok;
    } catch {
        return false;
    }
}

//  Supprime un contact sur le serveur (requête DELETE)
export async function supprimerSurLeServeur(id) {
    try {
        // On cible le contact à supprimer via son id dans l'URL
        const reponse = await fetch(`${URL_CONTACTS}/${id}`,
            { method: "DELETE" }); // DELETE = supprimer la ressource ciblée

        // Retourne true si la suppression a réussi, false sinon
        return reponse.ok;
    } catch {
        return false;
    }
}
