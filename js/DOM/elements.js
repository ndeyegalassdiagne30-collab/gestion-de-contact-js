//  On récupère chaque élément une seule fois ici,
//  puis on l'exporte pour que les autres fichiers puissent l'utiliser.

// Champ caché qui stocke l'identifiant du contact qu'on est en train de modifier
export const editIdInput = document.getElementById("editId");

// Le formulaire d'ajout / modification de contact
export const form = document.getElementById("contactForm");

// Champ de saisie du prénom
export const firstNameEl = document.getElementById("firstName");

// Champ de saisie du nom
export const lastNameEl = document.getElementById("lastName");

// Champ de saisie de l'email
export const emailEl = document.getElementById("email");

// Champ de saisie du numéro de téléphone
export const phoneEl = document.getElementById("phone");

// Menu déroulant pour choisir le rôle
export const roleEl = document.getElementById("role");

// Le texte à l'intérieur du bouton soumettre ("Ajouter" ou "Mettre à jour")
export const submitLabel = document.getElementById("submitLabel");

// Le bouton "Annuler" (visible uniquement en mode modification)
export const cancelBtn = document.getElementById("cancelBtn");

// La liste <ul> qui contient toutes les cartes contact affichées
export const contactList = document.getElementById("contactList");

// Le compteur affiché en haut de la liste ("3 contacts")
export const listCount = document.getElementById("listCount");

// Le message "Aucun contact" affiché quand la liste est vide
export const emptyState = document.getElementById("emptyState");

// Le champ de recherche pour filtrer les contacts en temps réel
export const searchInput = document.getElementById("searchInput");

// Le bouton "Supprimer la sélection" (s'active seulement si 3 contacts cochés minimum)
export const deleteSelBtn = document.getElementById("deleteSelBtn");

// Le chiffre affiché dans le bouton : "Supprimer la sélection (3)"
export const selCountEl = document.getElementById("selCount");

// La case à cocher "Tout sélectionner" de la barre de multi-sélection
export const selectAllChk = document.getElementById("selectAllChk");

// La zone où s'affichent les boutons de pagination (←  1  2  3  →)
export const paginationEl = document.getElementById("pagination");

// La zone en haut à droite où apparaissent les notifications toast
export const toastContainer = document.getElementById("toastContainer");

// Éléments des modals 

// La fenêtre modale qui demande confirmation avant de supprimer UN seul contact
export const modalDelete = document.getElementById("modalDelete");

// Le texte dans la modale simple (ex : "Supprimer Ami Diouf ? Cette action…")
export const modalDeleteDesc = document.getElementById("modalDeleteDesc");

// Le bouton "Annuler" de la modale simple
export const modalDeleteCancel = document.getElementById("modalDeleteCancel");

// Le bouton "Supprimer" de la modale simple (confirme la suppression)
export const modalDeleteConfirm = document.getElementById("modalDeleteConfirm");

// La fenêtre modale pour supprimer PLUSIEURS contacts en même temps
export const modalDeleteMulti = document.getElementById("modalDeleteMulti");

// Le texte dans la modale multiple
export const modalDeleteMultiDesc = document.getElementById("modalDeleteMultiDesc");

// Le bouton "Annuler" de la modale multiple
export const modalDeleteMultiCancel = document.getElementById("modalDeleteMultiCancel");

// Le bouton "Supprimer" de la modale multiple (confirme la suppression groupée)
export const modalDeleteMultiConfirm = document.getElementById("modalDeleteMultiConfirm");
