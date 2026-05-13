 const URL_CONTACTS = "http://localhost:3000/contacts";

export async function recupererLesContactsDuServeur() {
    try {
        const reponse = await fetch(URL_CONTACTS);
        if (!reponse.ok) {
            return [];
        }
        const donnees = await reponse.json();
        return Array.isArray(donnees) ? donnees : [];
    } catch {
        return [];
    }
}

export async function ajouterSurLeServeur(contactSansId) {
    try {
        const reponse = await fetch(URL_CONTACTS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactSansId),
        });
        return reponse.ok;
    } catch {
        return false;
    }
}

export async function modifierSurLeServeur(id, contact) {
    try {
        const reponse = await fetch(`${URL_CONTACTS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contact),
        });
        return reponse.ok;
    } catch {
        return false;
    }
}

export async function supprimerSurLeServeur(id) {
    try {
        const reponse = await fetch(`${URL_CONTACTS}/${id}`,
         { method: "DELETE" });
        return reponse.ok;
    } catch {
        return false;
    }
}
