// contactServices.js — Logique métier et affichage des contacts
// C'est le fichier central : il gère tout ce qui concerne les contacts
// (chargement, filtrage, pagination, CRUD, affichage, formulaire).

// On importe les fonctions HTTP qui parlent au serveur
import {
    recupererLesContactsDuServeur,
    ajouterSurLeServeur,
    modifierSurLeServeur,
    supprimerSurLeServeur,
} from "../stores/contactStores.js";

// On importe la fonction de validation du formulaire
import { validateForm } from "../utils/valider.js";

// On importe tous les éléments HTML dont on a besoin
import {
    form, editIdInput, firstNameEl, lastNameEl, emailEl, phoneEl, roleEl,
    submitLabel, cancelBtn, contactList, listCount, emptyState,
    searchInput, paginationEl,
} from "../DOM/elements.js";

// On importe la fonction pour afficher des notifications
import { showToast } from "../UI/messageRenderer.js";

// État de l'application

// Tableau en mémoire qui contient tous les contacts chargés depuis le serveur
let contactsCache = [];

// Nombre de contacts affichés par page
const PER_PAGE = 6;

// Page actuellement affichée (commence à 1)
export let currentPage = 1;

// Texte de recherche actuellement saisi dans la barre de recherche
export let searchQuery = "";

// Ensemble des identifiants des contacts actuellement cochés
export let selectedIds = new Set();

// Identifiant du contact en attente de suppression (en cours de confirmation)
export let pendingDeleteId = null;

// Fonctions pour modifier l'état depuis d'autres fichiers
export function setCurrentPage(p)    { currentPage     = p;  }
export function setSearchQuery(q)    { searchQuery     = q;  }
export function setPendingDeleteId(id) { pendingDeleteId = id; }

// Synchronisation avec le serveur

// Récupère les contacts depuis le serveur et les stocke dans contactsCache
export async function syncContactsFromServer() {
    contactsCache = await recupererLesContactsDuServeur();
}

// Accès aux données

// Retourne tous les contacts du cache
export function getContacts() {
    return contactsCache;
}

// Retourne les contacts filtrés selon la recherche en cours
export function getFiltered() {
    // Convertit la recherche en minuscules et supprime les espaces
    const q = searchQuery.trim().toLowerCase();

    // Si la barre de recherche est vide, on retourne tous les contacts
    if (!q) return getContacts();

    // Sinon, on garde uniquement les contacts qui contiennent le texte recherché
    // (on cherche dans prénom, nom, email, téléphone et rôle)
    return getContacts().filter((c) =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.role}`
            .toLowerCase()
            .includes(q)
    );
}

// Calcule le nombre total de pages selon le nombre de contacts filtrés
// Math.ceil arrondit au supérieur : 7 contacts / 6 par page = 2 pages
export function getTotalPages(filtered) {
    return Math.max(1, Math.ceil(filtered.length / PER_PAGE));
}

// Retourne uniquement la tranche de contacts à afficher sur la page courante
export function getPageSlice(filtered) {
    const start = (currentPage - 1) * PER_PAGE; // index de début selon la page
    return filtered.slice(start, start + PER_PAGE);
}

// Affichage de la liste

// Réaffiche toute la liste des contacts (appelé après chaque modification)
export function renderList() {
    const filtered   = getFiltered();
    const totalPages = getTotalPages(filtered);

    // Si la page courante n'existe plus, on revient à la dernière disponible
    if (currentPage > totalPages) currentPage = totalPages;

    const slice = getPageSlice(filtered);

    // Efface le contenu actuel de la liste HTML
    contactList.innerHTML = "";

    // Met à jour le compteur ("3 contacts")
    const total = getContacts().length;
    listCount.textContent = `${total} contact${total > 1 ? "s" : ""}`;

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden"); // affiche le message "Aucun contact"
    } else {
        emptyState.classList.add("hidden");    // cache le message "Aucun contact"
        slice.forEach((c) => contactList.appendChild(createCard(c)));
    }

    renderPagination(filtered.length, totalPages);

    // Import dynamique pour éviter une dépendance circulaire entre les deux fichiers
    import("../UI/modalRenderer.js").then(({ updateSelectionUI }) => updateSelectionUI());
}

// Affichage de la pagination

// Crée les boutons de navigation entre les pages (← 1 2 3 →)
export function renderPagination(total, totalPages) {
    paginationEl.innerHTML = "";

    // Si tous les contacts tiennent sur une seule page, pas besoin de pagination
    if (total <= PER_PAGE) return;

    // Bouton "←" pour aller à la page précédente
    const prev = document.createElement("button");
    prev.className   = "page-btn";
    prev.textContent = "←";
    prev.disabled    = currentPage === 1; // désactivé sur la première page
    prev.addEventListener("click", () => { currentPage--; renderList(); });
    paginationEl.appendChild(prev);

    // Boutons numérotés (1, 2, 3…)
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className   = "page-btn" + (i === currentPage ? " active" : "");
        btn.textContent = i;
        btn.addEventListener("click", () => { currentPage = i; renderList(); });
        paginationEl.appendChild(btn);
    }

    // Bouton "→" pour aller à la page suivante
    const next = document.createElement("button");
    next.className   = "page-btn";
    next.textContent = "→";
    next.disabled    = currentPage === totalPages; // désactivé sur la dernière page
    next.addEventListener("click", () => { currentPage++; renderList(); });
    paginationEl.appendChild(next);
}

// Message d'aide affiché si le serveur JSON n'est pas démarré
const MSG_SERVEUR = "Ouvre un terminal dans le dossier baseContact, puis lance : npm install puis npm run diagne";

// Création d'un contact

// Ajoute un nouveau contact sur le serveur puis met à jour le cache
export async function createContact(data) {
    // Prépare l'objet sans id (le serveur le génère automatiquement)
    const contactSansId = {
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(), // normalise en minuscules
        phone:     data.phone.trim(),
        role:      data.role,
        // Date formatée en français : "21 mai 2026"
        createdAt: new Date().toLocaleDateString("fr-FR", {
            day: "2-digit", month: "short", year: "numeric",
        }),
    };

    const ok = await ajouterSurLeServeur(contactSansId);
    await syncContactsFromServer(); // recharge la liste à jour
    return ok;
}

// Retrouve un contact dans le cache par son identifiant
export function getContactById(id) {
    return getContacts().find((c) => c.id === id) || null;
}

// Modification d'un contact

// Met à jour un contact existant sur le serveur
export async function updateContact(id, data) {
    const existant = getContactById(id);
    if (!existant) return null;

    // Fusionne les anciennes valeurs (id, createdAt…) avec les nouvelles
    const misAJour = {
        ...existant,
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
    };

    const ok = await modifierSurLeServeur(id, misAJour);
    await syncContactsFromServer();

    if (!ok) return null;
    return getContactById(id);
}

// Suppression d'un contact

// Supprime un seul contact sur le serveur
export async function deleteContact(id) {
    const ok = await supprimerSurLeServeur(id);
    await syncContactsFromServer();
    return ok;
}

// Supprime plusieurs contacts en même temps
export async function deleteContacts(ids) {
    for (const id of ids) {
        const ok = await supprimerSurLeServeur(id);

        // Si une suppression échoue, on arrête tout
        if (!ok) {
            await syncContactsFromServer();
            return false;
        }
    }
    await syncContactsFromServer();
    return true;
}

// Gestion des erreurs du formulaire

// Affiche les messages d'erreur sous chaque champ invalide
export function showErrors(errors) {
    clearErrors();

    const fields = ["firstName", "lastName", "email", "phone", "role"];
    fields.forEach((f) => {
        const errEl   = document.getElementById(`err-${f}`);
        const inputEl = document.getElementById(f);
        if (errors[f]) {
            errEl.textContent = errors[f];
            inputEl.classList.add("invalid");
        }
    });

    // Place le curseur sur le premier champ en erreur
    const first = fields.find((f) => errors[f]);
    if (first) document.getElementById(first).focus();
}

// Efface tous les messages d'erreur du formulaire
export function clearErrors() {
    ["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
        document.getElementById(`err-${f}`).textContent = "";
        document.getElementById(f).classList.remove("invalid");
    });
}

// Efface l'erreur d'un champ dès que l'utilisateur commence à le modifier
["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
    document.getElementById(f).addEventListener("input", () => {
        document.getElementById(`err-${f}`).textContent = "";
        document.getElementById(f).classList.remove("invalid");
    });
});

// Mode édition

// Charge un contact dans le formulaire pour le modifier
export function setEditMode(contact) {
    editIdInput.value = contact.id;
    firstNameEl.value = contact.firstName;
    lastNameEl.value  = contact.lastName;
    emailEl.value     = contact.email;
    phoneEl.value     = contact.phone;
    roleEl.value      = contact.role;

    submitLabel.textContent = "Mettre à jour";
    cancelBtn.classList.add("visible");
    clearErrors();

    // Surligne la carte du contact en cours de modification
    document.querySelectorAll(".contact-card").forEach((el) => {
        el.classList.toggle("editing", String(el.dataset.id) === String(contact.id));
    });

    // Fait défiler le panneau gauche vers le haut
    document.querySelector(".panel-form").scrollTo({ top: 0, behavior: "smooth" });
    firstNameEl.focus();
}

// Réinitialise le formulaire (vide les champs et annule le mode édition)
export function resetForm() {
    form.reset();
    editIdInput.value       = "";
    submitLabel.textContent = "Ajouter";
    cancelBtn.classList.remove("visible");
    clearErrors();

    document.querySelectorAll(".contact-card.editing").forEach((el) => {
        el.classList.remove("editing");
    });
}

// Clic sur "Annuler" → remet le formulaire à zéro
cancelBtn.addEventListener("click", () => resetForm());

// Soumission du formulaire

form.addEventListener("submit", async (e) => {
    // Empêche le rechargement de la page
    e.preventDefault();

    const data = {
        firstName: firstNameEl.value,
        lastName:  lastNameEl.value,
        email:     emailEl.value,
        phone:     phoneEl.value,
        role:      roleEl.value,
    };

    // Valide le format des champs (email, téléphone, champs vides…)
    const errors     = validateForm(data);
    const id         = editIdInput.value;
    const allContacts = getContacts();
    const idNum      = id ? String(id) : null;

    // Vérifie les doublons (en excluant le contact en cours de modification)
    const isDuplicateEmail = allContacts.find(
        (c) => c.email === data.email.trim().toLowerCase() && c.id !== idNum
    );
    const isDuplicatePhone = allContacts.find(
        (c) => c.phone === data.phone.trim() && c.id !== idNum
    );

    if (isDuplicateEmail)       errors.email = "Cet email est déjà utilisé.";
    else if (isDuplicatePhone)  errors.phone = "Ce numéro de téléphone est déjà utilisé.";

    if (Object.keys(errors).length > 0) {
        showErrors(errors);
        return;
    }

    clearErrors();

    // Cas 1 : id présent → mode modification
    if (id) {
        const updated = await updateContact(String(id), data);
        if (!updated) {
            showToast("danger", "Erreur", MSG_SERVEUR);
            return;
        }
        resetForm();
        renderList();
        showToast("success", "Contact mis à jour",
            `${updated.firstName} ${updated.lastName} a été modifié avec succès.`);

    // Cas 2 : pas d'id → mode ajout
    } else {
        const ok = await createContact(data);
        if (!ok) {
            showToast("danger", "Erreur", MSG_SERVEUR);
            return;
        }
        resetForm();
        currentPage = getTotalPages(getFiltered()); // va à la dernière page pour voir le nouveau contact
        renderList();

        const liste   = getContacts();
        const dernier = liste[liste.length - 1];
        showToast("success", "Contact ajouté",
            dernier
                ? `${dernier.firstName} ${dernier.lastName} a été ajouté avec succès.`
                : "Contact ajouté avec succès.");
    }
});

// Filtre la liste en temps réel à chaque frappe dans la barre de recherche
searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderList();
});

// Création d'une carte contact

// Retourne les initiales d'un contact (ex: "Ami Diouf" → "AD")
export function initials(f, l) {
    return ((f[0] || "") + (l[0] || "")).toUpperCase();
}

// Crée et retourne l'élément HTML <li> représentant une carte contact
export function createCard(contact) {
    const li = document.createElement("li");
    li.className  = "contact-card" + (selectedIds.has(contact.id) ? " selected" : "");
    li.dataset.id = contact.id;

    li.innerHTML = `
        <input type="checkbox" class="card-checkbox" data-id="${contact.id}"
               ${selectedIds.has(contact.id) ? "checked" : ""} title="Sélectionner" />
        <div class="card-top">
            <div class="card-avatar">${initials(contact.firstName, contact.lastName)}</div>
            <div>
                <div class="card-name">${contact.firstName} ${contact.lastName}</div>
                <div class="card-role">${contact.role}</div>
            </div>
        </div>
        <div class="card-info">
            <div class="card-info-row"><span>@</span>${contact.email}</div>
            <div class="card-info-row"><span>☏</span>${contact.phone}</div>
            <div class="card-info-row"><span>↗</span>Ajouté le ${contact.createdAt}</div>
        </div>
        <div class="card-actions">
            <button class="btn-edit"   data-id="${contact.id}">Modifier</button>
            <button class="btn-delete" data-id="${contact.id}">Supprimer</button>
        </div>
    `;

    return li;
}

// Démarrage

// S'exécute automatiquement au chargement : charge les contacts et affiche la liste
(async function demarrer() {
    await syncContactsFromServer();
    renderList();
})();
