import api from "./api";

/**
 * Initier un paiement PayDunya pour une commande.
 * @param {number|string} commandeId 
 */
export const payerCommande = async (commandeId) => {
    try {
        const response = await api.post(`/paiements/${commandeId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur initiation paiement pour commande ${commandeId} :`, error);
        throw error;
    }
};
