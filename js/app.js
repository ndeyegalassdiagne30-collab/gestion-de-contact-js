import {
    contactList,
    modalDelete, modalDeleteDesc,
} from "./DOM/elements.js";
import {
    getContactById,
    setEditMode,
    setPendingDeleteId,
} from "./services/contactServices.js";
import { openModal } from "./UI/modalRenderer.js";

// DÉLÉGATION — boutons Modifier / Supprimer sur les cartes

contactList.addEventListener("click", (e) => {
    const editBtn   = e.target.closest(".btn-edit");
    const deleteBtn = e.target.closest(".btn-delete");

    // ── MODIFIER ──
    if (editBtn) {
        const id      = String(editBtn.dataset.id);
        const contact = getContactById(id);
        if (!contact) return;
        setEditMode(contact);
    }

    // ── SUPPRIMER (ouvre le modal) ──
    if (deleteBtn) {
        const id      = String(deleteBtn.dataset.id);
        const contact = getContactById(id);
        if (!contact) return;
        setPendingDeleteId(id);
        modalDeleteDesc.textContent =
            `Supprimer ${contact.firstName} ${contact.lastName} ? Cette action est irréversible.`;
        openModal(modalDelete);
    }
});