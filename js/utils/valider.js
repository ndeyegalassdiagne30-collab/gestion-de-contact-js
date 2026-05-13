// ── Validations du formulaire contact

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(70|71|75|76|77|78)\d{7}$/;

export function validateForm(data) {
    const errors = {};

    if (!data.firstName.trim()) {
        errors.firstName = "Le prénom est requis.";
    }
    if (!data.lastName.trim()) {
        errors.lastName = "Le nom est requis.";
    }
    if (!data.email.trim()) {
        errors.email = "L'email est requis.";
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
        errors.email = "Format invalide. Ex: nom@domaine.com";
    
    if (!data.phone.trim()) {
        errors.phone = "Le numéro est requis.";
    } else if (!PHONE_REGEX.test(data.phone.trim())) {
        errors.phone =
            "Format invalide. Ex: 771234567 (70/71/75/76/77/78 + 7 chiffres)";
    }
    if (!data.role) {
        errors.role = "Veuillez choisir un rôle.";
    }
    }

    return errors;
}
