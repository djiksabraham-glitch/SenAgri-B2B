import api from "./api";

/**
 * Récupérer les statistiques globales de la plateforme.
 */
export const getStatistiques = async () => {
    try {
        const response = await api.get("/statistiques");
        return response.data;
    } catch (error) {
        console.error("Erreur chargement statistiques admin :", error);
        throw error;
    }
};

/**
 * Récupérer les journaux d'audit (Audit Logs).
 */
export const getAuditLogs = async (params = {}) => {
    try {
        const response = await api.get("/audit-logs", { params });
        return response.data;
    } catch (error) {
        console.error("Erreur chargement audit logs :", error);
        throw error;
    }
};

/**
 * Récupérer un journal d'audit par ID.
 */
export const getAuditLogById = async (id) => {
    try {
        const response = await api.get(`/audit-logs/${id}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Erreur chargement audit log ${id} :`, error);
        throw error;
    }
};

/**
 * Créer une nouvelle catégorie.
 */
export const createCategorie = async (data) => {
    try {
        const response = await api.post("/categories", data);
        return response.data;
    } catch (error) {
        console.error("Erreur création catégorie :", error);
        throw error;
    }
};

/**
 * Mettre à jour une catégorie existante.
 */
export const updateCategorie = async (id, data) => {
    try {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erreur mise à jour catégorie ${id} :`, error);
        throw error;
    }
};

/**
 * Supprimer une catégorie.
 */
export const deleteCategorie = async (id) => {
    try {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur suppression catégorie ${id} :`, error);
        throw error;
    }
};

/**
 * Récupérer la liste des utilisateurs (Admin).
 */
export const getUsers = async () => {
    try {
        const response = await api.get("/users");
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur chargement utilisateurs admin :", error);
        throw error;
    }
};

/**
 * Suspendre ou Activer le compte d'un utilisateur.
 */
export const toggleUserActif = async (id) => {
    try {
        const response = await api.patch(`/users/${id}/toggle-actif`);
        return response.data;
    } catch (error) {
        console.error(`Erreur toggle actif utilisateur ${id} :`, error);
        throw error;
    }
};

/**
 * Mettre à jour les informations/rôle d'un utilisateur.
 */
export const updateUser = async (id, data) => {
    try {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erreur mise à jour utilisateur ${id} :`, error);
        throw error;
    }
};

/**
 * Supprimer un compte utilisateur.
 */
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur suppression utilisateur ${id} :`, error);
        throw error;
    }
};
