// ── Modals & Sélection
import {
    modalDelete, modalDeleteDesc, modalDeleteCancel, modalDeleteConfirm,
    modalDeleteMulti, modalDeleteMultiDesc, modalDeleteMultiCancel, modalDeleteMultiConfirm,
    contactList, selectAllChk, deleteSelBtn, selCountEl, editIdInput,
} from "../DOM/elements.js";
import { showToast } from "./messageRenderer.js";
import {
    selectedIds, pendingDeleteId, setPendingDeleteId,
    getFiltered, getPageSlice,
    deleteContact, deleteContacts, getContactById,
    renderList, setCurrentPage, resetForm,
} from "../services/contactServices.js";

const MSG_SERVEUR = "Ouvre un terminal dans le dossier json_serveur, puis : npm install puis npm run serve";

export function openModal(overlay) { overlay.classList.add("open"); }
export function closeModal(overlay) { overlay.classList.remove("open"); }

[modalDelete, modalDeleteMulti].forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal(overlay);
    });
});

export function updateSelectionUI() {
    const count = selectedIds.size;
    selCountEl.textContent = count;
    deleteSelBtn.disabled = count < 3;

    const visibleIds = getPageSlice(getFiltered()).map((c) => c.id);
    const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    selectAllChk.checked = allChecked;
    selectAllChk.indeterminate = !allChecked && visibleIds.some((id) => selectedIds.has(id));
}

contactList.addEventListener("change", (e) => {
    const chk = e.target.closest(".card-checkbox");
    if (!chk) return;
    const id = Number(chk.dataset.id);
    if (chk.checked) selectedIds.add(id);
    else selectedIds.delete(id);

    chk.closest(".contact-card").classList.toggle("selected", chk.checked);
    updateSelectionUI();
});

selectAllChk.addEventListener("change", () => {
    const visibleIds = getPageSlice(getFiltered()).map((c) => c.id);
    if (selectAllChk.checked) visibleIds.forEach((id) => selectedIds.add(id));
    else visibleIds.forEach((id) => selectedIds.delete(id));
    renderList();
});

deleteSelBtn.addEventListener("click", () => {
    if (selectedIds.size < 3) return;
    const count = selectedIds.size;
    modalDeleteMultiDesc.textContent =
        `Vous allez supprimer ${count} contact${count > 1 ? "s" : ""}. Cette action est irréversible.`;
    openModal(modalDeleteMulti);
});

modalDeleteMultiCancel.addEventListener("click", () => closeModal(modalDeleteMulti));

modalDeleteMultiConfirm.addEventListener("click", async () => {
    const count = selectedIds.size;
    const ok = await deleteContacts(new Set(selectedIds));
    if (!ok) {
        showToast("danger", "Erreur", MSG_SERVEUR);
        return;
    }
    selectedIds.clear();
    closeModal(modalDeleteMulti);
    setCurrentPage(1);
    renderList();
    showToast("danger", "Contacts supprimés", `${count} contacts ont été supprimés.`);
});

modalDeleteCancel.addEventListener("click", () => {
    closeModal(modalDelete);
    setPendingDeleteId(null);
});

modalDeleteConfirm.addEventListener("click", async () => {
    const pid = pendingDeleteId;
    if (!pid) return;
    const contact = getContactById(pid);
    const name = contact ? `${contact.firstName} ${contact.lastName}` : "le contact";
    const ok = await deleteContact(pid);
    if (!ok) {
        showToast("danger", "Erreur", MSG_SERVEUR);
        return;
    }
    selectedIds.delete(pid);
    if (Number(editIdInput.value) === pid) resetForm();
    setPendingDeleteId(null);
    closeModal(modalDelete);
    renderList();
    showToast("danger", "Contact supprimé", `${name} a été supprimé avec succès.`);
});
