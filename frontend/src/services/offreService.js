import api from "./api";

export const getOffres = async (params = {}) => {
    try {
        const response = await api.get("/offres", { params });

        console.log("Réponse API offres :", response.data);

        if (response.data && response.data.data !== undefined) {
            return response.data.data;
        } else if (Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error("Erreur API offres :", error);
        throw error;
    }
};

export const getOffreById = async (id) => {
    try {
        const response = await api.get(`/offres/${id}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Erreur API offre ${id} :`, error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await api.get("/categories");
        console.log("Catégories API :", response.data);

        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        return [];
    } catch (error) {
        console.error("Erreur API catégories :", error);
        return [];
    }
};

export const createOffre = async (data) => {
    try {
        const response = await api.post("/offres", data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de l'offre :", error);
        throw error;
    }
};

export const uploadImageOffre = async (offreId, file, ordreAffichage = 1) => {
    try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("ordre_affichage", ordreAffichage);

        const response = await api.post(`/offres/${offreId}/images`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de l'upload de l'image pour l'offre ${offreId} :`, error);
        throw error;
    }
};

export const updateOffre = async (id, data) => {
    try {
        const response = await api.put(`/offres/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la modification de l'offre ${id} :`, error);
        throw error;
    }
};

export const deleteOffre = async (id) => {
    try {
        const response = await api.delete(`/offres/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression de l'offre ${id} :`, error);
        throw error;
    }
};