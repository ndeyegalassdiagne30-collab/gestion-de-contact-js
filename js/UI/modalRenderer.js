// modalRenderer.js — Modals de confirmation et sélection multiple
// Ce fichier gère :
//   - l'ouverture / fermeture des fenêtres modales
//   - la sélection de contacts par case à cocher
//   - la suppression groupée (minimum 3 contacts)

// On importe tous les éléments HTML dont on a besoin
import {
    modalDelete, modalDeleteDesc, modalDeleteCancel, modalDeleteConfirm,
    modalDeleteMulti, modalDeleteMultiDesc, modalDeleteMultiCancel, modalDeleteMultiConfirm,
    contactList, selectAllChk, deleteSelBtn, selCountEl, editIdInput,
} from "../DOM/elements.js";

// On importe la fonction pour afficher des notifications
import { showToast } from "./messageRenderer.js";

// On importe les fonctions de gestion des contacts
import {
    selectedIds, pendingDeleteId, setPendingDeleteId, // état de sélection et id en attente
    getFiltered, getPageSlice,                        // pour savoir quels contacts sont visibles
    deleteContact, deleteContacts, getContactById,    // pour supprimer
    renderList, setCurrentPage, resetForm,            // pour rafraîchir l'affichage
} from "../services/contactServices.js";

// Message d'erreur en cas de problème serveur
const MSG_SERVEUR = "Ouvre un terminal dans le dossier baseContact, puis : npm install puis npm run diagne";

// Affiche une fenêtre modale (lui ajoute la classe "open")
export function openModal(overlay) { overlay.classList.add("open"); }

// Cache une fenêtre modale (lui retire la classe "open")
export function closeModal(overlay) { overlay.classList.remove("open"); }

// Ferme la modale si on clique en dehors (sur le fond sombre, pas sur la boîte blanche)
[modalDelete, modalDeleteMulti].forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
        // e.target = l'élément sur lequel on a cliqué
        // Si c'est exactement l'overlay (fond) et pas la modale elle-même → on ferme
        if (e.target === overlay) closeModal(overlay);
    });
});

// Met à jour l'interface de sélection multiple
// Appelé à chaque fois que la sélection change pour que tout soit à jour
export function updateSelectionUI() {
    // Nombre de contacts actuellement cochés
    const count = selectedIds.size;

    // Affiche le nombre dans le bouton "Supprimer la sélection (X)"
    selCountEl.textContent = count;

    // Active le bouton seulement si au moins 3 contacts sont sélectionnés
    deleteSelBtn.disabled = count < 3;

    // Récupère les identifiants des contacts visibles sur la page actuelle
    const visibleIds = getPageSlice(getFiltered()).map((c) => c.id);

    // Vérifie si TOUS les contacts visibles sont cochés
    const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

    // Met à jour la case "Tout sélectionner" selon l'état de la sélection
    selectAllChk.checked       = allChecked;  // cochée = tous sélectionnés
    // état intermédiaire : certains cochés mais pas tous (le carré devient un tiret)
    selectAllChk.indeterminate = !allChecked && visibleIds.some((id) => selectedIds.has(id));
}

// Écoute les cases à cocher individuelles sur chaque carte contact
contactList.addEventListener("change", (e) => {
    // Vérifie que c'est bien une case à cocher de carte (et pas autre chose)
    const chk = e.target.closest(".card-checkbox");
    if (!chk) return; // si ce n'est pas une case de carte, on ignore

    // Récupère l'identifiant du contact associé à cette case
    const id = chk.dataset.id;

    // Ajoute ou retire l'id dans l'ensemble des contacts sélectionnés
    if (chk.checked) selectedIds.add(id);    // case cochée   → ajoute l'id
    else             selectedIds.delete(id); // case décochée → retire l'id

    // Ajoute ou retire la classe "selected" sur la carte (pour la couleur de fond)
    chk.closest(".contact-card").classList.toggle("selected", chk.checked);

    // Rafraîchit le compteur et l'état du bouton de suppression groupée
    updateSelectionUI();
});

// Écoute la case "Tout sélectionner"
selectAllChk.addEventListener("change", () => {
    // Récupère les identifiants de tous les contacts visibles sur la page
    const visibleIds = getPageSlice(getFiltered()).map((c) => c.id);

    if (selectAllChk.checked) {
        // Case cochée → on ajoute tous les ids visibles à la sélection
        visibleIds.forEach((id) => selectedIds.add(id));
    } else {
        // Case décochée → on retire tous les ids visibles de la sélection
        visibleIds.forEach((id) => selectedIds.delete(id));
    }

    // Réaffiche la liste pour mettre à jour le style visuel des cartes
    renderList();
});

// Écoute le clic sur le bouton "Supprimer la sélection"
deleteSelBtn.addEventListener("click", () => {
    // Sécurité : on ne fait rien si moins de 3 contacts sont sélectionnés
    if (selectedIds.size < 3) return;

    // Récupère le nombre de contacts sélectionnés
    const count = selectedIds.size;

    // Met à jour le texte de la modale multiple avec le nombre exact
    modalDeleteMultiDesc.textContent =
        `Vous allez supprimer ${count} contact${count > 1 ? "s" : ""}. Cette action est irréversible.`;

    // Ouvre la fenêtre modale de confirmation pour la suppression groupée
    openModal(modalDeleteMulti);
});

// Bouton "Annuler" de la modale suppression multiple → ferme sans supprimer
modalDeleteMultiCancel.addEventListener("click", () => closeModal(modalDeleteMulti));

// Bouton "Supprimer" de la modale suppression multiple → confirme la suppression
modalDeleteMultiConfirm.addEventListener("click", async () => {
    // Mémorise le nombre avant la suppression (selectedIds sera vidé après)
    const count = selectedIds.size;

    // Envoie les suppressions au serveur (une par une dans la boucle)
    // On crée une copie de selectedIds car on va le vider juste après
    const ok = await deleteContacts(new Set(selectedIds));

    // Si une suppression a échoué (serveur éteint, etc.)
    if (!ok) {
        showToast("danger", "Erreur", MSG_SERVEUR);
        return;
    }

    // Vide l'ensemble des contacts sélectionnés
    selectedIds.clear();

    // Ferme la fenêtre modale
    closeModal(modalDeleteMulti);

    // Retourne à la première page pour éviter une page vide
    setCurrentPage(1);

    // Rafraîchit l'affichage de la liste
    renderList();

    // Affiche une notification de confirmation
    showToast("danger", "Contacts supprimés", `${count} contacts ont été supprimés.`);
});

// Bouton "Annuler" de la modale suppression simple → ferme sans supprimer
modalDeleteCancel.addEventListener("click", () => {
    closeModal(modalDelete);      // ferme la modale
    setPendingDeleteId(null);     // réinitialise l'id en attente
});

// Bouton "Supprimer" de la modale suppression simple → confirme la suppression
modalDeleteConfirm.addEventListener("click", async () => {
    // Récupère l'id du contact en attente de suppression
    const pid = pendingDeleteId;

    // Sécurité : si aucun id n'est en attente, on ne fait rien
    if (!pid) return;

    // Récupère les infos du contact pour afficher son nom dans la notification
    const contact = getContactById(pid);
    const name = contact ? `${contact.firstName} ${contact.lastName}` : "le contact";

    // Envoie la requête de suppression au serveur
    const ok = await deleteContact(pid);

    // Si la suppression a échoué
    if (!ok) {
        showToast("danger", "Erreur", MSG_SERVEUR);
        return;
    }

    // Retire le contact supprimé de la sélection (s'il était coché)
    selectedIds.delete(pid);

    // Si ce contact était en cours de modification dans le formulaire, on réinitialise le formulaire
    if (String(editIdInput.value) === String(pid)) resetForm();

    // Réinitialise l'id en attente
    setPendingDeleteId(null);

    // Ferme la fenêtre modale
    closeModal(modalDelete);

    // Rafraîchit la liste des contacts
    renderList();

    // Affiche une notification de confirmation
    showToast("danger", "Contact supprimé", `${name} a été supprimé avec succès.`);
});
