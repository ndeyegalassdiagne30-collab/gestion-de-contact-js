//  valider.js  —  Règles de validation du formulaire contact
//  Ce fichier vérifie que les données saisies sont correctes
//  avant d'envoyer quoi que ce soit au serveur.


// Règle de validation pour l'email
// ^ = début,  [^\s@]+ = un ou plusieurs caractères (ni espace ni @)
// @ = le symbole arobase obligatoire
// [^\s@]+ = le nom de domaine,  \.  = le point,  [^\s@]+ = l'extension (.com, .fr…)
// $ = fin
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Règle de validation pour le numéro de téléphone sénégalais
// Doit commencer par 70, 71, 75, 76, 77 ou 78, suivi de exactement 7 chiffres
// Exemple valide : 771234567
const PHONE_REGEX = /^(70|71|75|76|77|78)\d{7}$/;

//  Vérifie toutes les données du formulaire et retourne les erreurs trouvées
// Paramètre : data = objet { firstName, lastName, email, phone, role }
// Retour    : objet errors (vide si tout est valide, sinon champ → message d'erreur)
export function validateForm(data) {
    // On crée un objet vide pour y ajouter les erreurs au fur et à mesure
    const errors = {};

    // Vérifie que le prénom n'est pas vide (trim supprime les espaces inutiles)
    if (!data.firstName.trim()) {
        errors.firstName = "Le prénom est requis.";
    }

    // Vérifie que le nom n'est pas vide
    if (!data.lastName.trim()) {
        errors.lastName = "Le nom est requis.";
    }

    // Vérifie que l'email est renseigné
    if (!data.email.trim()) {
        errors.email = "L'email est requis.";

    // Si l'email est renseigné, on vérifie qu'il respecte le bon format (test avec regex)
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
        errors.email = "Format invalide. Ex: nom@domaine.com";
    }

    // Vérifie que le téléphone est renseigné
    if (!data.phone.trim()) {
        errors.phone = "Le numéro est requis.";

    // Si le téléphone est renseigné, on vérifie qu'il correspond au format sénégalais
    } else if (!PHONE_REGEX.test(data.phone.trim())) {
        errors.phone =
            "Format invalide. Ex: 771234567 (70/71/75/76/77/78 + 7 chiffres)";
    }

    // Vérifie qu'un rôle a été sélectionné dans le menu déroulant
    if (!data.role) {
        errors.role = "Veuillez choisir un rôle.";
    }

    // Retourne l'objet errors :
    // - S'il est vide  tout est valide
    // - S'il contient des clés il y a des erreurs à afficher
    return errors;
}
