import api from "./api";

/**
 * Récupérer les informations du profil utilisateur connecté.
 */
export const getProfil = async () => {
    try {
        const response = await api.get("/profil");
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur chargement profil :", error);
        throw error;
    }
};

/**
 * Mettre à jour les informations du profil (nom, téléphone, adresse, email).
 */
export const updateProfil = async (data) => {
    try {
        const response = await api.put("/profil", data);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur mise à jour profil :", error);
        throw error;
    }
};

/**
 * Téléverser ou remplacer la photo de profil.
 * @param {FormData} formData
 */
export const uploadPhotoProfil = async (formData) => {
    try {
        const response = await api.post("/profil/photo", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erreur téléversement photo profil :", error);
        throw error;
    }
};

/**
 * Supprimer la photo de profil.
 */
export const deletePhotoProfil = async () => {
    try {
        const response = await api.delete("/profil/photo");
        return response.data;
    } catch (error) {
        console.error("Erreur suppression photo profil :", error);
        throw error;
    }
};

/**
 * Supprimer définitivement le compte utilisateur.
 * Conformément à la Loi n° 2008-12 du 25 janvier 2008.
 */
export const deleteAccount = async () => {
    try {
        const response = await api.delete("/profil/account");
        return response.data;
    } catch (error) {
        console.error("Erreur suppression compte :", error);
        throw error;
    }
};
