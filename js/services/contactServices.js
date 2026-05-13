
import {
    recupererLesContactsDuServeur,
    ajouterSurLeServeur,
    modifierSurLeServeur,
    supprimerSurLeServeur,
} from "../stores/contactStores.js";
import { validateForm } from "../utils/valider.js";
import {
    form, editIdInput, firstNameEl, lastNameEl, emailEl, phoneEl, roleEl,
    submitLabel, cancelBtn, contactList, listCount, emptyState,
    searchInput, paginationEl,
} from "../DOM/elements.js";
import { showToast } from "../UI/messageRenderer.js";

let contactsCache = [];

export async function syncContactsFromServer() {
    contactsCache = await recupererLesContactsDuServeur();
}

const PER_PAGE = 6;

export let currentPage = 1;
export let searchQuery = "";
export let selectedIds = new Set();
export let pendingDeleteId = null;

export function setCurrentPage(p) { currentPage = p; }
export function setSearchQuery(q) { searchQuery = q; }
export function setPendingDeleteId(id) { pendingDeleteId = id; }

export function getContacts() {
    return contactsCache;
}

export function getFiltered() {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return getContacts();
    return getContacts().filter((c) =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.role}`
            .toLowerCase()
            .includes(q)
    );
}

export function getTotalPages(filtered) {
    return Math.max(1, Math.ceil(filtered.length / PER_PAGE));
}

export function getPageSlice(filtered) {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
}

export function renderList() {
    const filtered = getFiltered();
    const totalPages = getTotalPages(filtered);

    if (currentPage > totalPages) currentPage = totalPages;

    const slice = getPageSlice(filtered);

    contactList.innerHTML = "";

    const total = getContacts().length;
    listCount.textContent = `${total} contact${total > 1 ? "s" : ""}`;

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        slice.forEach((c) => contactList.appendChild(createCard(c)));
    }

    renderPagination(filtered.length, totalPages);

    import("../UI/modalRenderer.js").then(({ updateSelectionUI }) => updateSelectionUI());
}

export function renderPagination(total, totalPages) {
    paginationEl.innerHTML = "";
    if (total <= PER_PAGE) return;

    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.textContent = "←";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => { currentPage--; renderList(); });
    paginationEl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn" + (i === currentPage ? " active" : "");
        btn.textContent = i;
        btn.addEventListener("click", () => { currentPage = i; renderList(); });
        paginationEl.appendChild(btn);
    }

    const next = document.createElement("button");
    next.className = "page-btn";
    next.textContent = "→";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => { currentPage++; renderList(); });
    paginationEl.appendChild(next);
}

const MSG_SERVEUR = "Ouvre un terminal dans le dossier json_serveur, puis lance : npm install puis npm run serve";

export async function createContact(data) {
    const contactSansId = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        role: data.role,
        createdAt: new Date().toLocaleDateString("fr-FR", {
            day: "2-digit", month: "short", year: "numeric",
        }),
    };
    const ok = await ajouterSurLeServeur(contactSansId);
    await syncContactsFromServer();
    return ok;
}

export function getContactById(id) {
    return getContacts().find((c) => c.id === id) || null;
}

export async function updateContact(id, data) {
    const existant = getContactById(id);
    if (!existant) return null;
    const misAJour = {
        ...existant,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        role: data.role,
    };
    const ok = await modifierSurLeServeur(id, misAJour);
    await syncContactsFromServer();
    if (!ok) return null;
    return getContactById(id);
}

export async function deleteContact(id) {
    const ok = await supprimerSurLeServeur(id);
    await syncContactsFromServer();
    return ok;
}

export async function deleteContacts(ids) {
    for (const id of ids) {
        const ok = await supprimerSurLeServeur(id);
        if (!ok) {
            await syncContactsFromServer();
            return false;
        }
    }
    await syncContactsFromServer();
    return true;
}

export function showErrors(errors) {
    clearErrors();
    const fields = ["firstName", "lastName", "email", "phone", "role"];
    fields.forEach((f) => {
        const errEl = document.getElementById(`err-${f}`);
        const inputEl = document.getElementById(f);
        if (errors[f]) {
            errEl.textContent = errors[f];
            inputEl.classList.add("invalid");
        }
    });
    const first = fields.find((f) => errors[f]);
    if (first) document.getElementById(first).focus();
}

export function clearErrors() {
    ["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
        document.getElementById(`err-${f}`).textContent = "";
        document.getElementById(f).classList.remove("invalid");
    });
}

["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
    document.getElementById(f).addEventListener("input", () => {
        document.getElementById(`err-${f}`).textContent = "";
        document.getElementById(f).classList.remove("invalid");
    });
});

export function setEditMode(contact) {
    editIdInput.value = contact.id;
    firstNameEl.value = contact.firstName;
    lastNameEl.value = contact.lastName;
    emailEl.value = contact.email;
    phoneEl.value = contact.phone;
    roleEl.value = contact.role;
    submitLabel.textContent = "Mettre à jour";
    cancelBtn.classList.add("visible");
    clearErrors();

    document.querySelectorAll(".contact-card").forEach((el) => {
        el.classList.toggle("editing", string(el.dataset.id) === contact.id);
    });

    document.querySelector(".panel-form").scrollTo({ top: 0, behavior: "smooth" });
    firstNameEl.focus();
}

export function resetForm() {
    form.reset();
    editIdInput.value = "";
    submitLabel.textContent = "Ajouter";
    cancelBtn.classList.remove("visible");
    clearErrors();
    document.querySelectorAll(".contact-card.editing").forEach((el) => {
        el.classList.remove("editing");
    });
}

cancelBtn.addEventListener("click", () => resetForm());

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        firstName: firstNameEl.value,
        lastName: lastNameEl.value,
        email: emailEl.value,
        phone: phoneEl.value,
        role: roleEl.value,
    };

    const errors = validateForm(data);
    const id = editIdInput.value;
    const allContacts = getContacts();
    const idNum = id ? String(id) : null;

    const isDuplicateEmail = allContacts.find(
        (c) => c.email === data.email.trim().toLowerCase() && c.id !== idNum
    );
    const isDuplicatePhone = allContacts.find(
        (c) => c.phone === data.phone.trim() && c.id !== idNum
    );

    if (isDuplicateEmail) errors.email = "Cet email est déjà utilisé.";
    else if (isDuplicatePhone) errors.phone = "Ce numéro de téléphone est déjà utilisé.";

    if (Object.keys(errors).length > 0) {
        showErrors(errors);
        return;
    }

    clearErrors();

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
    } else {
        const ok = await createContact(data);
        if (!ok) {
            showToast("danger", "Erreur", MSG_SERVEUR);
            return;
        }
        resetForm();
        currentPage = getTotalPages(getFiltered());
        renderList();
        const liste = getContacts();
        const dernier = liste[liste.length - 1];
        showToast("success", "Contact ajouté",
            dernier
                ? `${dernier.firstName} ${dernier.lastName} a été ajouté avec succès.`
                : "Contact ajouté avec succès.");
    }
});

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderList();
});

export function initials(f, l) {
    return ((f[0] || "") + (l[0] || "")).toUpperCase();
}

export function createCard(contact) {
    const li = document.createElement("li");
    li.className = "contact-card" + (selectedIds.has(contact.id) ? " selected" : "");
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
            <button class="btn-edit" data-id="${contact.id}">Modifier</button>
            <button class="btn-delete" data-id="${contact.id}">Supprimer</button>
        </div>
    `;

    return li;
}

(async function demarrer() {
    await syncContactsFromServer();
    renderList();
})();
