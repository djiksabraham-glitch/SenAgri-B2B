import api from "./api";

/**
 * Récupérer la liste des conversations de l'utilisateur connecté.
 */
export const getConversations = async () => {
    try {
        const response = await api.get("/messages");
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Erreur chargement conversations :", error);
        throw error;
    }
};

/**
 * Récupérer tous les messages avec un interlocuteur donné.
 * @param {number|string} userId 
 */
export const getMessagesAvecUser = async (userId) => {
    try {
        const response = await api.get(`/messages/${userId}`);
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error(`Erreur chargement messages avec l'utilisateur ${userId} :`, error);
        throw error;
    }
};

/**
 * Envoyer un message à un utilisateur.
 * @param {Object} payload { destinataire_id, offre_id, contenu }
 */
export const envoyerMessage = async (payload) => {
    try {
        const response = await api.post("/messages", payload);
        return response.data;
    } catch (error) {
        console.error("Erreur envoi message :", error);
        throw error;
    }
};

/**
 * Marquer la conversation avec un utilisateur comme lue.
 * @param {number|string} userId 
 */
export const marquerConversationLue = async (userId) => {
    try {
        const response = await api.put(`/messages/${userId}/read`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors du marquage comme lu avec user ${userId} :`, error);
        throw error;
    }
};
