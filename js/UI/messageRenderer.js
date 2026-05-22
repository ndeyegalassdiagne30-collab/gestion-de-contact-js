// ══════════════════════════════════════════════════════════════════════════
//  messageRenderer.js  —  Affichage des notifications toast
//  Un "toast" est une petite boîte de notification qui apparaît
//  en haut à droite de l'écran et disparaît automatiquement.
// ══════════════════════════════════════════════════════════════════════════

// On importe la zone HTML où les toasts seront ajoutés
import { toastContainer } from "../DOM/elements.js";

// Association entre le type de toast et son icône :
// "success" → ✓ vert   "danger" → ✕ rouge   "warn" → ! orange
const TOAST_ICONS = { success: "✓", danger: "✕", warn: "!" };

// Crée et affiche un nouveau toast à l'écran
// type    : "success", "danger" ou "warn" (détermine la couleur)
// title   : le titre affiché en gras dans le toast
// message : le texte de détail sous le titre (peut être vide)
export function showToast(type, title, message) {
    // Crée un nouvel élément <div> vide dans le document
    const toast = document.createElement("div");

    // Ajoute les classes CSS pour le style visuel (ex : "toast toast--success")
    toast.className = `toast toast--${type}`;

    // Remplit le div avec le contenu HTML du toast
    toast.innerHTML = `
        <div class="toast-icon">${TOAST_ICONS[type]}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-msg">${message}</div>` : ""}
        </div>
        <button class="toast-close" title="Fermer">×</button>
        <div class="toast-progress"></div>
    `;
    // La barre de progression (toast-progress) s'anime en CSS sur 4 secondes

    // Insère le toast dans la zone de notifications → il devient visible
    toastContainer.appendChild(toast);

    // Quand l'utilisateur clique sur le × du toast, on le fait disparaître
    toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast));

    // Programmation d'une disparition automatique après 4 secondes (4000 ms)
    const timer = setTimeout(() => dismissToast(toast), 4000);

    // On mémorise l'identifiant du timer dans le toast lui-même
    // Cela permettra de l'annuler si l'utilisateur clique sur × avant les 4 secondes
    toast._timer = timer;
}

// Fait disparaître un toast avec une animation de sortie
export function dismissToast(toast) {
    // Annule le timer automatique si le toast est fermé manuellement avant 4 secondes
    clearTimeout(toast._timer);

    // Ajoute la classe CSS qui déclenche l'animation de fondu de sortie
    toast.classList.add("toast--out");

    // Après 240 ms (durée de l'animation CSS), supprime définitivement le toast du DOM
    setTimeout(() => toast.remove(), 240);
}
