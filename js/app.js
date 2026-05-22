// app.js — Point d'entrée de l'application
// C'est le premier fichier chargé par le navigateur (via index.html)
// Il initialise le routeur, la connexion, et délègue les clics sur les cartes

// On importe les éléments HTML dont on a besoin dans ce fichier
import {
    contactList,       // la liste <ul> des cartes contact
    modalDelete,       // la fenêtre modale de suppression simple
    modalDeleteDesc,   // le texte dans la modale ("Supprimer Ami Diouf ?")
} from "./DOM/elements.js";

// On importe les fonctions de gestion des contacts
import {
    getContactById,      // retrouve un contact par son id
    setEditMode,         // charge un contact dans le formulaire pour le modifier
    setPendingDeleteId,  // mémorise l'id du contact qu'on veut supprimer
} from "./services/contactServices.js";

// On importe la fonction pour ouvrir une fenêtre modale
import { openModal } from "./UI/modalRenderer.js";

// On importe la fonction qui démarre le routeur SPA
import { initRouter } from "./router.js";

// On importe la fonction qui initialise le formulaire de connexion
import { initLogin } from "./UI/loginRenderer.js";

// Démarre le routeur : lit l'URL et affiche la bonne page
initRouter();

// Initialise le formulaire de connexion et le bouton de déconnexion
initLogin();

// Délégation d'événements sur les cartes contact
// Au lieu d'ajouter un écouteur sur chaque carte (qui se créent dynamiquement),
// on écoute les clics sur la liste parente et on détecte quel bouton a été cliqué.
contactList.addEventListener("click", (e) => {
    // Vérifie si le clic était sur un bouton "Modifier" (ou à l'intérieur)
    const editBtn   = e.target.closest(".btn-edit");

    // Vérifie si le clic était sur un bouton "Supprimer" (ou à l'intérieur)
    const deleteBtn = e.target.closest(".btn-delete");

    // Si on a cliqué sur "Modifier"
    if (editBtn) {
        // Récupère l'id du contact depuis l'attribut data-id du bouton
        const id      = String(editBtn.dataset.id);

        // Retrouve l'objet contact complet dans le cache grâce à son id
        const contact = getContactById(id);

        // Sécurité : si le contact n'existe pas, on ne fait rien
        if (!contact) return;

        // Remplit le formulaire avec les données du contact pour le modifier
        setEditMode(contact);
    }

    // Si on a cliqué sur "Supprimer"
    if (deleteBtn) {
        // Récupère l'id du contact depuis l'attribut data-id du bouton
        const id      = String(deleteBtn.dataset.id);

        // Retrouve l'objet contact complet dans le cache
        const contact = getContactById(id);

        // Sécurité : si le contact n'existe pas, on ne fait rien
        if (!contact) return;

        // Mémorise l'id du contact en attente de suppression (pour la modale)
        setPendingDeleteId(id);

        // Personalise le message dans la modale avec le nom du contact
        modalDeleteDesc.textContent =
            `Supprimer ${contact.firstName} ${contact.lastName} ? Cette action est irréversible.`;

        // Ouvre la fenêtre modale de confirmation
        openModal(modalDelete);
    }
});
