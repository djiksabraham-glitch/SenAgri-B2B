import api from "./api";

/**
 * Créer une nouvelle commande pour une offre.
 * @param {Object} data { offre_id: number, quantite: number }
 */
export const createCommande = async (data) => {
    try {
        const response = await api.post("/commandes", data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de la commande :", error);
        throw error;
    }
};

export const creerCommande = createCommande;

/**
 * Récupérer la liste des commandes de l'utilisateur connecté.
 */
export const getMesCommandes = async (params = {}) => {
    try {
        const response = await api.get("/commandes", { params });
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
        throw error;
    }
};

/**
 * Récupérer le détail d'une commande par ID.
 */
export const getCommandeById = async (id) => {
    try {
        const response = await api.get(`/commandes/${id}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Erreur lors du chargement de la commande ${id} :`, error);
        throw error;
    }
};

/**
 * Mettre à jour le statut d'une commande (ex: confirmée, livrée, annulée).
 */
export const updateStatutCommande = async (id, statut) => {
    try {
        const response = await api.put(`/commandes/${id}`, { statut });
        return response.data;
    } catch (error) {
        console.error(`Erreur mise à jour statut commande ${id} :`, error);
        throw error;
    }
};

/**
 * Télécharger la facture PDF d'une commande avec le token d'authentification.
 */
export const downloadFacture = async (id) => {
    try {
        const response = await api.get(`/commandes/${id}/facture`, {
            responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Facture-Commande-#${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Erreur lors du téléchargement de la facture ${id} :`, error);
        throw error;
    }
};
