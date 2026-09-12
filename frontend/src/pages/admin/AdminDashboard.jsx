import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import { useAuth } from "../../hooks/useAuth";
import {
    getStatistiques,
    getAuditLogs,
    createCategorie,
    updateCategorie,
    deleteCategorie,
    getUsers,
    toggleUserActif,
    updateUser as updateUserService,
    deleteUser as deleteUserService,
} from "../../services/adminService";
import { getCategories, getOffres } from "../../services/offreService";
import { getMesCommandes, downloadFacture } from "../../services/commandeService";
import {
    FaUserShield, FaChartLine, FaTags, FaBox, FaShoppingBag,
    FaHistory, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle,
    FaSearch, FaEye, FaCoins, FaUsers, FaChartBar, FaCalendarAlt,
    FaTimes, FaFilePdf, FaStore, FaLayerGroup, FaInfoCircle,
    FaUserCog, FaBan, FaUserCheck, FaUserEdit, FaPhone, FaMapMarkerAlt, FaShieldAlt
} from "react-icons/fa";

export default function AdminDashboard() {
    const { user } = useAuth();

    // Onglet actif : "vue-d-ensemble" | "categories" | "offres" | "commandes" | "audit-logs" | "utilisateurs"
    const [activeTab, setActiveTab] = useState("vue-d-ensemble");

    // Données d'administration
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [offres, setOffres] = useState([]);
    const [commandes, setCommandes] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [usersList, setUsersList] = useState([]);

    // États de chargement
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingOffres, setLoadingOffres] = useState(true);
    const [loadingCommandes, setLoadingCommandes] = useState(true);
    const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Messages Flash
    const [succesMsg, setSuccesMsg] = useState("");
    const [erreurMsg, setErreurMsg] = useState("");
    const [downloadingPdfId, setDownloadingPdfId] = useState(null);

    const handleDownloadPdf = async (cmdId) => {
        try {
            setDownloadingPdfId(cmdId);
            await downloadFacture(cmdId);
        } catch (err) {
            console.error("Erreur lors du téléchargement de la facture PDF :", err);
            setErreurMsg("Erreur lors du téléchargement de la facture.");
            setTimeout(() => setErreurMsg(""), 4000);
        } finally {
            setDownloadingPdfId(null);
        }
    };

    // Modal Catégorie (Création & Édition)
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [submittingCategory, setSubmittingCategory] = useState(false);

    // Modal Confirmation Suppression Catégorie
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);

    // Modal Édition / Rôle Utilisateur
    const [editingUser, setEditingUser] = useState(null);
    const [editingUserRole, setEditingUserRole] = useState("acheteur");
    const [submittingUserEdit, setSubmittingUserEdit] = useState(false);

    // Modal Suppression Utilisateur
    const [deletingUser, setDeletingUser] = useState(null);
    const [deletingUserLoading, setDeletingUserLoading] = useState(false);

    // Action en cours sur suspension/activation
    const [togglingUserId, setTogglingUserId] = useState(null);

    // Modal Détail Audit Log
    const [selectedAuditLog, setSelectedAuditLog] = useState(null);

    // Filtres de recherche
    const [searchCategory, setSearchCategory] = useState("");
    const [searchOffre, setSearchOffre] = useState("");
    const [searchCommande, setSearchCommande] = useState("");
    const [searchAudit, setSearchAudit] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [filterRole, setFilterRole] = useState("tous");

    // Charger les données initiales
    const fetchStatistiques = async () => {
        try {
            setLoadingStats(true);
            const data = await getStatistiques();
            setStats(data);
        } catch (err) {
            console.error("Erreur chargement stats admin :", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchCategoriesData = async () => {
        try {
            setLoadingCategories(true);
            const data = await getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur chargement catégories admin :", err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchOffresData = async () => {
        try {
            setLoadingOffres(true);
            const data = await getOffres();
            setOffres(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur chargement offres admin :", err);
        } finally {
            setLoadingOffres(false);
        }
    };

    const fetchCommandesData = async () => {
        try {
            setLoadingCommandes(true);
            const data = await getMesCommandes();
            setCommandes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur chargement commandes admin :", err);
        } finally {
            setLoadingCommandes(false);
        }
    };

    const fetchAuditLogsData = async () => {
        try {
            setLoadingAuditLogs(true);
            const data = await getAuditLogs();
            const logsList = data?.data || (Array.isArray(data) ? data : []);
            setAuditLogs(logsList);
        } catch (err) {
            console.error("Erreur chargement audit logs :", err);
        } finally {
            setLoadingAuditLogs(false);
        }
    };

    const fetchUsersData = async () => {
        try {
            setLoadingUsers(true);
            const data = await getUsers();
            setUsersList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur chargement utilisateurs admin :", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchStatistiques();
        fetchCategoriesData();
        fetchOffresData();
        fetchCommandesData();
        fetchAuditLogsData();
        fetchUsersData();
    }, []);

    // -------------------------------------------------------------
    // GESTION DES CATÉGORIES (Créer, Modifier, Supprimer)
    // -------------------------------------------------------------
    const handleOpenCategoryModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryName(cat.nom || "");
        } else {
            setEditingCategory(null);
            setCategoryName("");
        }
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setSubmittingCategory(true);
        setErreurMsg("");
        setSuccesMsg("");

        try {
            if (editingCategory) {
                await updateCategorie(editingCategory.id, { nom: categoryName.trim() });
                setSuccesMsg(`Catégorie "${categoryName}" mise à jour avec succès.`);
            } else {
                await createCategorie({ nom: categoryName.trim() });
                setSuccesMsg(`Nouvelle catégorie "${categoryName}" créée avec succès.`);
            }
            setShowCategoryModal(false);
            setCategoryName("");
            setEditingCategory(null);

            await fetchCategoriesData();
            await fetchStatistiques();

            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur enregistrement catégorie :", err);
            const msg = err.response?.data?.message || "Erreur lors de la sauvegarde de la catégorie.";
            setErreurMsg(msg);
        } finally {
            setSubmittingCategory(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!deletingCategory) return;

        setDeletingCategoryLoading(true);
        setErreurMsg("");
        setSuccesMsg("");

        try {
            await deleteCategorie(deletingCategory.id);
            setSuccesMsg(`La catégorie "${deletingCategory.nom}" a été supprimée.`);
            setDeletingCategory(null);

            await fetchCategoriesData();
            await fetchStatistiques();

            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur suppression catégorie :", err);
            const msg = err.response?.data?.message || "Impossible de supprimer cette catégorie.";
            setErreurMsg(msg);
            setDeletingCategory(null);
            setTimeout(() => setErreurMsg(""), 5000);
        } finally {
            setDeletingCategoryLoading(false);
        }
    };

    // -------------------------------------------------------------
    // GESTION DES UTILISATEURS (Activer, Suspendre, Rôle, Supprimer)
    // -------------------------------------------------------------
    const handleToggleUserActif = async (u) => {
        if (u.id === user?.id) {
            setErreurMsg("Vous ne pouvez pas suspendre votre propre compte administrateur.");
            setTimeout(() => setErreurMsg(""), 4000);
            return;
        }

        setTogglingUserId(u.id);
        setErreurMsg("");
        setSuccesMsg("");

        try {
            const res = await toggleUserActif(u.id);
            setSuccesMsg(res.message || "Statut de l'utilisateur mis à jour.");

            await fetchUsersData();
            await fetchStatistiques();
            await fetchAuditLogsData();

            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur suspension/activation utilisateur :", err);
            const msg = err.response?.data?.message || "Erreur lors du changement de statut de l'utilisateur.";
            setErreurMsg(msg);
            setTimeout(() => setErreurMsg(""), 4000);
        } finally {
            setTogglingUserId(null);
        }
    };

    const handleOpenEditUserModal = (u) => {
        setEditingUser(u);
        setEditingUserRole(u.role || "acheteur");
    };

    const handleSaveUserRole = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setSubmittingUserEdit(true);
        setErreurMsg("");
        setSuccesMsg("");

        try {
            await updateUserService(editingUser.id, { role: editingUserRole });
            setSuccesMsg(`Le rôle de ${editingUser.nom} a été mis à jour avec succès en "${editingUserRole}".`);

            setEditingUser(null);
            await fetchUsersData();
            await fetchStatistiques();
            await fetchAuditLogsData();

            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur modification utilisateur :", err);
            const msg = err.response?.data?.message || "Erreur lors de la mise à jour du rôle.";
            setErreurMsg(msg);
        } finally {
            setSubmittingUserEdit(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;

        if (deletingUser.id === user?.id) {
            setErreurMsg("Vous ne pouvez pas supprimer votre propre compte.");
            setDeletingUser(null);
            setTimeout(() => setErreurMsg(""), 4000);
            return;
        }

        setDeletingUserLoading(true);
        setErreurMsg("");
        setSuccesMsg("");

        try {
            await deleteUserService(deletingUser.id);
            setSuccesMsg(`Le compte de ${deletingUser.nom} a été définitivement supprimé.`);
            setDeletingUser(null);

            await fetchUsersData();
            await fetchStatistiques();
            await fetchAuditLogsData();

            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur suppression utilisateur :", err);
            const msg = err.response?.data?.message || "Erreur lors de la suppression du compte.";
            setErreurMsg(msg);
            setDeletingUser(null);
            setTimeout(() => setErreurMsg(""), 4000);
        } finally {
            setDeletingUserLoading(false);
        }
    };

    // Helper URLs images
    const getImageUrl = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
        if (typeof img === "object" && img.url) return img.url;
        const path = typeof img === "object" ? (img.chemin_fichier || "") : img;
        if (!path) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const clean = path.replace(/^\//, "").replace(/^public\//, "");
        return clean.startsWith("storage/")
            ? `http://127.0.0.1:8000/${clean}`
            : `http://127.0.0.1:8000/storage/${clean}`;
    };

    // Badges Audit Log Actions
    const getActionBadge = (action) => {
        switch (action?.toLowerCase()) {
            case "création":
            case "creation":
                return <span className="px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-black rounded-full uppercase tracking-wider">Création</span>;
            case "modification":
                return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-wider">Modification</span>;
            case "suppression":
                return <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-black rounded-full uppercase tracking-wider">Suppression</span>;
            case "suspension":
                return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase tracking-wider">Suspension</span>;
            case "réactivation":
            case "reactivation":
                return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">Réactivation</span>;
            default:
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full uppercase tracking-wider">{action}</span>;
        }
    };

    // Badges Rôle Utilisateur
    const getUserRoleBadge = (role) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1"><FaShieldAlt className="text-purple-600" /> Admin</span>;
            case "vendeur":
            case "producteur":
                return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">Vendeur</span>;
            case "acheteur":
            default:
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full uppercase tracking-wider">Acheteur</span>;
        }
    };

    // Filtres des tableaux
    const categoriesFiltrees = categories.filter((c) =>
        (c.nom || "").toLowerCase().includes(searchCategory.toLowerCase())
    );

    const offresFiltrees = offres.filter((o) =>
        (o.nom || "").toLowerCase().includes(searchOffre.toLowerCase()) ||
        (o.vendeur?.nom || o.vendeur?.name || "").toLowerCase().includes(searchOffre.toLowerCase())
    );

    const commandesFiltrees = commandes.filter((c) =>
        String(c.id).includes(searchCommande) ||
        (c.offre?.nom || "").toLowerCase().includes(searchCommande.toLowerCase()) ||
        (c.acheteur?.nom || "").toLowerCase().includes(searchCommande.toLowerCase())
    );

    const auditLogsFiltres = auditLogs.filter((log) =>
        (log.table_concernee || log.table_nom || log.table || "").toLowerCase().includes(searchAudit.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(searchAudit.toLowerCase()) ||
        (log.utilisateur?.nom || log.user?.nom || log.user?.name || log.utilisateur?.email || log.user?.email || "").toLowerCase().includes(searchAudit.toLowerCase())
    );

    const usersFiltres = usersList.filter((u) => {
        const matchesSearch = (u.nom || "").toLowerCase().includes(searchUser.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(searchUser.toLowerCase()) ||
            (u.telephone || "").includes(searchUser);
        
        const matchesRole = filterRole === "tous" || u.role === filterRole || (filterRole === "vendeur" && u.role === "producteur");

        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            {/* En-tête Tableau de Bord Administrateur */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white py-10 px-6 border-b border-emerald-800/40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="px-3.5 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 w-fit">
                            <FaUserShield className="text-emerald-400" /> Espace Administrateur SenAgri
                        </span>
                        <h1 className="text-3xl font-black mt-2 tracking-tight">
                            Panneau de Contrôle Global ⚙️
                        </h1>
                        <p className="text-slate-300 text-sm mt-1">
                            Supervisez les transactions B2B, gérez le catalogue de catégories, administrez les comptes et consultez les journaux d'audit.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                            {user?.nom ? user.nom.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div className="text-xs">
                            <p className="font-bold text-white">{user?.nom || "Administrateur"}</p>
                            <p className="text-emerald-300 text-[10px] uppercase font-semibold">Super Admin</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu Principal */}
            <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">

                {/* Notifications Flash */}
                {succesMsg && (
                    <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-emerald-600 text-lg flex-shrink-0" />
                            <p className="text-sm font-semibold text-emerald-800">{succesMsg}</p>
                        </div>
                        <button onClick={() => setSuccesMsg("")} className="text-emerald-700 hover:text-emerald-900">
                            <FaTimes />
                        </button>
                    </div>
                )}

                {erreurMsg && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <FaExclamationCircle className="text-red-500 text-lg flex-shrink-0" />
                            <p className="text-sm font-semibold text-red-700">{erreurMsg}</p>
                        </div>
                        <button onClick={() => setErreurMsg("")} className="text-red-700 hover:text-red-900">
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Cartes de KPI / Statistiques Générales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl flex-shrink-0 font-bold">
                            <FaUsers />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Utilisateurs inscrits</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                                {loadingStats ? "..." : (stats?.utilisateurs ?? 0)}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                                {stats?.vendeurs ?? 0} Vendeurs actifs
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0 font-bold">
                            <FaStore />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Offres Publiées</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                                {loadingStats ? "..." : (stats?.offres ?? 0)}
                            </h3>
                            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                {stats?.offres_disponibles ?? 0} disponibles
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl flex-shrink-0 font-bold">
                            <FaShoppingBag />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Commandes B2B</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                                {loadingStats ? "..." : (stats?.commandes ?? 0)}
                            </h3>
                            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                                {stats?.quantite_vendue ?? 0} Kg de récolte vendus
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl flex-shrink-0 font-bold">
                            <FaCoins />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Chiffre d'Affaires</p>
                            <h3 className="text-2xl font-black text-emerald-700 mt-0.5">
                                {loadingStats ? "..." : Number(stats?.chiffre_affaires ?? 0).toLocaleString("fr-FR")} <span className="text-xs">FCFA</span>
                            </h3>
                            <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Total cumulé</p>
                        </div>
                    </div>

                </div>

                {/* Barre d'Onglets de Navigation Administrateur */}
                <div className="flex flex-wrap gap-2 bg-gray-200/80 p-1.5 rounded-2xl mb-8 border border-gray-200/60 w-fit">
                    <button
                        onClick={() => setActiveTab("vue-d-ensemble")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                            activeTab === "vue-d-ensemble"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaChartLine className="text-sm" /> Vue d'ensemble
                    </button>

                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                            activeTab === "categories"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaTags className="text-sm" /> Catégories ({categories.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("offres")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                            activeTab === "offres"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaBox className="text-sm" /> Toutes les Offres ({offres.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("commandes")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                            activeTab === "commandes"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaShoppingBag className="text-sm" /> Commandes ({commandes.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("audit-logs")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                            activeTab === "audit-logs"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaHistory className="text-sm" /> Journaux d'Audit ({auditLogs.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("utilisateurs")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                            activeTab === "utilisateurs"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaUserCog className="text-sm" /> Gestion Utilisateurs ({usersList.length})
                    </button>
                </div>

                {/* ============================================================
                    ONGLET 1 : VUE D'ENSEMBLE & ANALYTIQUES
                ============================================================ */}
                {activeTab === "vue-d-ensemble" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Top Produits les plus vendus */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                                    <FaChartBar className="text-emerald-600" /> Récoltes les plus vendues
                                </h3>
                                <span className="text-xs text-gray-400 font-semibold">Top 5 B2B</span>
                            </div>

                            {loadingStats ? (
                                <div className="py-12 text-center text-xs text-gray-400">Chargement...</div>
                            ) : !stats?.produits_plus_vendus || stats.produits_plus_vendus.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center">Aucune donnée de vente disponible.</p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.produits_plus_vendus.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{item.offre?.nom || `Offre #${item.offre_id}`}</h4>
                                                    <p className="text-[11px] text-gray-400">Prix unitaire : {Number(item.offre?.prix_unitaire || 0).toLocaleString("fr-FR")} FCFA</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-emerald-700 text-sm bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                                                {item.total_vendu} unités vendues
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ventes par mois */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                                    <FaCalendarAlt className="text-emerald-600" /> Évolution du Chiffre d'Affaires
                                </h3>
                                <span className="text-xs text-gray-400 font-semibold">Par mois</span>
                            </div>

                            {loadingStats ? (
                                <div className="py-12 text-center text-xs text-gray-400">Chargement...</div>
                            ) : !stats?.ventes_par_mois || stats.ventes_par_mois.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center">Aucune vente enregistrée pour le moment.</p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.ventes_par_mois.map((v, idx) => {
                                        const moisNoms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
                                        const nomMois = moisNoms[(v.mois - 1) % 12] || `Mois ${v.mois}`;

                                        return (
                                            <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                                <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                                    {nomMois}
                                                </span>
                                                <span className="font-black text-gray-900 text-sm">
                                                    {Number(v.chiffre_affaires).toLocaleString("fr-FR")} FCFA
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* ============================================================
                    ONGLET 2 : GESTION DES CATÉGORIES (CRUD ADMIN)
                ============================================================ */}
                {activeTab === "categories" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
                        
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Catégories de Produits Agricoles</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Gérez la nomenclature des récoltes disponibles sur la plateforme.</p>
                            </div>

                            <button
                                onClick={() => handleOpenCategoryModal()}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                            >
                                <FaPlus /> Ajouter une catégorie
                            </button>
                        </div>

                        {/* Barre de Recherche */}
                        <div className="px-6 pb-2">
                            <div className="relative max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FaSearch className="text-xs" />
                                </div>
                                <input
                                    type="text"
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    placeholder="Filtrer les catégories..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {loadingCategories ? (
                            <div className="py-16 text-center text-xs text-gray-400">Chargement des catégories...</div>
                        ) : categoriesFiltrees.length === 0 ? (
                            <p className="py-12 text-center text-xs text-gray-400">Aucune catégorie trouvée.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                                            <th className="py-3.5 px-6">ID</th>
                                            <th className="py-3.5 px-6">Nom de la Catégorie</th>
                                            <th className="py-3.5 px-6">Offres Associées</th>
                                            <th className="py-3.5 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                                        {categoriesFiltrees.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-4 px-6 text-gray-400">#{cat.id}</td>
                                                <td className="py-4 px-6 font-extrabold text-gray-900 text-sm flex items-center gap-2">
                                                    <FaLayerGroup className="text-emerald-600 text-xs" />
                                                    {cat.nom}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-100 text-[11px]">
                                                        {cat.offres_count ?? (Array.isArray(cat.offres) ? cat.offres.length : offres.filter((o) => Number(o.categorie_id || o.categorie?.id) === Number(cat.id)).length)} offre(s)
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleOpenCategoryModal(cat)}
                                                        className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                        title="Modifier cette catégorie"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingCategory(cat)}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Supprimer cette catégorie"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                )}

                {/* ============================================================
                    ONGLET 3 : SUPERVISION DE TOUTES LES OFFRES
                ============================================================ */}
                {activeTab === "offres" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
                        
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Toutes les Offres Publiées</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Surveillance du catalogue agricole global de la plateforme.</p>
                            </div>

                            <div className="relative max-w-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FaSearch className="text-xs" />
                                </div>
                                <input
                                    type="text"
                                    value={searchOffre}
                                    onChange={(e) => setSearchOffre(e.target.value)}
                                    placeholder="Rechercher offre ou vendeur..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {loadingOffres ? (
                            <div className="py-16 text-center text-xs text-gray-400">Chargement des offres...</div>
                        ) : offresFiltrees.length === 0 ? (
                            <p className="py-12 text-center text-xs text-gray-400">Aucune offre ne correspond à la recherche.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                                            <th className="py-3.5 px-6">Produit</th>
                                            <th className="py-3.5 px-6">Catégorie</th>
                                            <th className="py-3.5 px-6">Vendeur</th>
                                            <th className="py-3.5 px-6">Prix Unitaire</th>
                                            <th className="py-3.5 px-6">Stock</th>
                                            <th className="py-3.5 px-6">Statut</th>
                                            <th className="py-3.5 px-6 text-right">Fiche</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                                        {offresFiltrees.map((o) => (
                                            <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-4 px-6 font-extrabold text-gray-900 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getImageUrl(o.images?.[0])}
                                                            alt={o.nom}
                                                            className="w-10 h-10 rounded-xl object-cover border border-gray-100"
                                                        />
                                                        <div>
                                                            <span className="block font-bold">{o.nom}</span>
                                                            <span className="text-[10px] text-gray-400">Réf #{o.id}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6 text-gray-600 font-semibold">
                                                    {o.categorie?.nom || "Général"}
                                                </td>

                                                <td className="py-4 px-6 font-bold text-gray-800">
                                                    {o.vendeur?.nom || o.vendeur?.name || "Producteur"}
                                                </td>

                                                <td className="py-4 px-6 text-emerald-700 font-black">
                                                    {Number(o.prix_unitaire).toLocaleString("fr-FR")} FCFA / {o.unite}
                                                </td>

                                                <td className="py-4 px-6">
                                                    <span className={`font-extrabold ${Number(o.quantite_disponible) > 0 ? "text-gray-900" : "text-red-500"}`}>
                                                        {o.quantite_disponible} {o.unite}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6">
                                                    {o.est_disponible && Number(o.quantite_disponible) > 0 ? (
                                                        <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-full text-[10px] border border-green-200">
                                                            Disponible
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-full text-[10px] border border-red-200">
                                                            Épuisé
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <Link
                                                        to={`/offres/${o.id}`}
                                                        className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg inline-block transition-colors"
                                                        title="Voir la fiche publique"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                )}

                {/* ============================================================
                    ONGLET 4 : SUPERVISION DES COMMANDES
                ============================================================ */}
                {activeTab === "commandes" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
                        
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Historique des Commandes B2B</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Suivi de l'ensemble des transactions passées sur la plateforme.</p>
                            </div>

                            <div className="relative max-w-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FaSearch className="text-xs" />
                                </div>
                                <input
                                    type="text"
                                    value={searchCommande}
                                    onChange={(e) => setSearchCommande(e.target.value)}
                                    placeholder="Rechercher par N° commande, offre ou acheteur..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {loadingCommandes ? (
                            <div className="py-16 text-center text-xs text-gray-400">Chargement des commandes...</div>
                        ) : commandesFiltrees.length === 0 ? (
                            <p className="py-12 text-center text-xs text-gray-400">Aucune commande trouvée.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                                            <th className="py-3.5 px-6">N° Commande</th>
                                            <th className="py-3.5 px-6">Offre</th>
                                            <th className="py-3.5 px-6">Acheteur</th>
                                            <th className="py-3.5 px-6">Quantité</th>
                                            <th className="py-3.5 px-6">Montant Total</th>
                                            <th className="py-3.5 px-6">Statut</th>
                                            <th className="py-3.5 px-6 text-right">Facture PDF</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                                        {commandesFiltrees.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-4 px-6 font-extrabold text-gray-900">
                                                    #{c.id}
                                                </td>

                                                <td className="py-4 px-6 font-bold text-gray-900">
                                                    {c.offre?.nom || `Offre #${c.offre_id}`}
                                                </td>

                                                <td className="py-4 px-6 text-gray-700">
                                                    {c.acheteur?.nom || c.acheteur?.name || "Client B2B"}
                                                </td>

                                                <td className="py-4 px-6 text-gray-900 font-bold">
                                                    {c.quantite} {c.offre?.unite || ""}
                                                </td>

                                                <td className="py-4 px-6 text-emerald-700 font-black">
                                                    {Number(c.prix_total).toLocaleString("fr-FR")} FCFA
                                                </td>

                                                <td className="py-4 px-6">
                                                    {c.statut === "payee" || c.est_payee ? (
                                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                                                            Payée
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold text-[10px] rounded-full border border-amber-200">
                                                            {c.statut}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => handleDownloadPdf(c.id)}
                                                        disabled={downloadingPdfId === c.id}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg inline-flex items-center justify-center transition-colors disabled:opacity-60 cursor-pointer"
                                                        title="Télécharger la facture PDF"
                                                    >
                                                        {downloadingPdfId === c.id ? (
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-red-600 border-t-transparent"></div>
                                                        ) : (
                                                            <FaFilePdf />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                )}

                {/* ============================================================
                    ONGLET 5 : JOURNAUX D'AUDIT & SÉCURITÉ (AUDIT LOGS)
                ============================================================ */}
                {activeTab === "audit-logs" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
                        
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Journaux d'Audit & Sécurité</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Traçabilité complète des actions effectuées sur la plateforme SenAgri.</p>
                            </div>

                            <div className="relative max-w-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FaSearch className="text-xs" />
                                </div>
                                <input
                                    type="text"
                                    value={searchAudit}
                                    onChange={(e) => setSearchAudit(e.target.value)}
                                    placeholder="Rechercher par table, action ou utilisateur..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {loadingAuditLogs ? (
                            <div className="py-16 text-center text-xs text-gray-400">Chargement des journaux d'audit...</div>
                        ) : auditLogsFiltres.length === 0 ? (
                            <p className="py-12 text-center text-xs text-gray-400">Aucun journal d'audit trouvé.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                                            <th className="py-3.5 px-6">Horodatage</th>
                                            <th className="py-3.5 px-6">Utilisateur</th>
                                            <th className="py-3.5 px-6">Action</th>
                                            <th className="py-3.5 px-6">Table Concernée</th>
                                            <th className="py-3.5 px-6">Réf ID</th>
                                            <th className="py-3.5 px-6 text-right">Détails Log</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                                        {auditLogsFiltres.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-4 px-6 text-gray-500 font-mono text-[11px]">
                                                    {log.date_action || log.created_at ? new Date(log.date_action || log.created_at).toLocaleString("fr-FR") : "-"}
                                                </td>

                                                <td className="py-4 px-6 font-bold text-gray-900">
                                                    {log.utilisateur?.nom || log.user?.nom || log.user?.name || (log.utilisateur?.id || log.user?.id || log.user_id ? `Utilisateur #${log.utilisateur?.id || log.user?.id || log.user_id}` : "Système")}
                                                </td>

                                                <td className="py-4 px-6">
                                                    {getActionBadge(log.action)}
                                                </td>

                                                <td className="py-4 px-6 font-mono text-emerald-800 font-bold">
                                                    {log.table_concernee || log.table_nom || log.table || "-"}
                                                </td>

                                                <td className="py-4 px-6 text-gray-400">
                                                    #{log.enregistrement_id || log.record_id || "-"}
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => setSelectedAuditLog(log)}
                                                        className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                                                    >
                                                        <FaInfoCircle /> Voir JSON
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                )}

                {/* ============================================================
                    ONGLET 6 : GESTION DES UTILISATEURS (ADMIN USER CONTROL)
                ============================================================ */}
                {activeTab === "utilisateurs" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
                        
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                    <FaUserCog className="text-emerald-600" /> Gestion des Comptes Utilisateurs
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Activez, suspendez ou gérez les rôles des acheteurs et vendeurs de la plateforme.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Sélection filtre par rôle */}
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-emerald-600"
                                >
                                    <option value="tous">Tous les Rôles</option>
                                    <option value="vendeur">Vendeurs / Producteurs</option>
                                    <option value="acheteur">Acheteurs</option>
                                    <option value="admin">Administrateurs</option>
                                </select>

                                {/* Champ de Recherche */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FaSearch className="text-xs" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        placeholder="Nom, email ou téléphone..."
                                        className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {loadingUsers ? (
                            <div className="py-16 text-center text-xs text-gray-400">Chargement des utilisateurs...</div>
                        ) : usersFiltres.length === 0 ? (
                            <p className="py-12 text-center text-xs text-gray-400">Aucun utilisateur ne correspond à la recherche.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                                            <th className="py-3.5 px-6">Utilisateur</th>
                                            <th className="py-3.5 px-6">Contact</th>
                                            <th className="py-3.5 px-6">Rôle</th>
                                            <th className="py-3.5 px-6">Statut Compte</th>
                                            <th className="py-3.5 px-6">Activité</th>
                                            <th className="py-3.5 px-6 text-right">Actions de Gestion</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                                        {usersFiltres.map((u) => (
                                            <tr key={u.id} className={`hover:bg-gray-50/80 transition-colors ${!u.est_actif ? "bg-red-50/30" : ""}`}>
                                                
                                                {/* Utilisateur & Photo */}
                                                <td className="py-4 px-6 font-extrabold text-gray-900 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden flex-shrink-0">
                                                            {u.photo_profil?.url || u.photo_url ? (
                                                                <img
                                                                    src={getImageUrl(u.photo_profil || u.photo_url)}
                                                                    alt={u.nom}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                u.nom ? u.nom.charAt(0).toUpperCase() : "U"
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="block font-bold text-gray-900">{u.nom}</span>
                                                            <span className="text-[10px] text-gray-400">ID #{u.id}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="py-4 px-6">
                                                    <p className="text-gray-900 font-bold">{u.email}</p>
                                                    <p className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                                                        <FaPhone className="text-[9px]" /> {u.telephone || "N/A"}
                                                    </p>
                                                </td>

                                                {/* Rôle */}
                                                <td className="py-4 px-6">
                                                    {getUserRoleBadge(u.role)}
                                                </td>

                                                {/* Statut Compte (Actif / Suspendu) */}
                                                <td className="py-4 px-6">
                                                    {u.est_actif ? (
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-800 font-bold text-[10px] rounded-full border border-green-200 flex items-center gap-1 w-fit">
                                                            <FaUserCheck className="text-green-600" /> Actif
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold text-[10px] rounded-full border border-red-200 flex items-center gap-1 w-fit">
                                                            <FaBan className="text-red-600" /> Suspendu
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Activité (Offres / Commandes) */}
                                                <td className="py-4 px-6 text-gray-600 text-[11px]">
                                                    {u.role === "vendeur" || u.role === "producteur" ? (
                                                        <span className="font-bold text-emerald-700">{u.offres_count ?? 0} offre(s)</span>
                                                    ) : (
                                                        <span className="font-bold text-blue-700">{u.commandes_count ?? 0} commande(s)</span>
                                                    )}
                                                </td>

                                                {/* Actions Administrateur */}
                                                <td className="py-4 px-6 text-right space-x-2">
                                                    
                                                    {/* Bouton Suspendre / Réactiver */}
                                                    <button
                                                        onClick={() => handleToggleUserActif(u)}
                                                        disabled={togglingUserId === u.id || u.id === user?.id}
                                                        className={`p-2 rounded-lg font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 ${
                                                            u.est_actif
                                                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        }`}
                                                        title={u.est_actif ? "Suspendre ce compte" : "Réactiver ce compte"}
                                                    >
                                                        {togglingUserId === u.id ? (
                                                            "..."
                                                        ) : u.est_actif ? (
                                                            <FaBan className="text-amber-600" />
                                                        ) : (
                                                            <FaUserCheck className="text-emerald-600" />
                                                        )}
                                                    </button>

                                                    {/* Bouton Modifier Rôle */}
                                                    <button
                                                        onClick={() => handleOpenEditUserModal(u)}
                                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                                        title="Modifier le rôle de l'utilisateur"
                                                    >
                                                        <FaUserEdit />
                                                    </button>

                                                    {/* Bouton Supprimer Compte */}
                                                    <button
                                                        onClick={() => setDeletingUser(u)}
                                                        disabled={u.id === user?.id}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                                                        title="Supprimer définitivement cet utilisateur"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                )}

            </main>

            {/* ============================================================
                MODAL CRÉATION / ÉDITION DE CATÉGRIE
            ============================================================ */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-gray-100">
                        <button
                            onClick={() => setShowCategoryModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                            {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                            {editingCategory ? "Ajustez le libellé de la catégorie" : "Définissez un nouveau type de récolte agricole"}
                        </p>

                        <form onSubmit={handleSaveCategory} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Nom de la Catégorie
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Ex: Céréales, Légumes, Fruits, Tubercules..."
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingCategory}
                                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    {submittingCategory ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================
                MODAL MODIFIER RÔLE UTILISATEUR
            ============================================================ */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-gray-100">
                        <button
                            onClick={() => setEditingUser(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                <FaUserEdit />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900">Modifier le profil de {editingUser.nom}</h3>
                                <p className="text-xs text-gray-500">{editingUser.email}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveUserRole} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Attribuer un nouveau rôle
                                </label>
                                <select
                                    value={editingUserRole}
                                    onChange={(e) => setEditingUserRole(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-600 transition-all"
                                >
                                    <option value="acheteur">Acheteur (Client B2B)</option>
                                    <option value="vendeur">Vendeur / Producteur</option>
                                    <option value="admin">Administrateur (Super Admin)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingUserEdit}
                                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                                >
                                    {submittingUserEdit ? "Mise à jour..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================
                MODAL CONFIRMATION SUPPRESSION UTILISATEUR
            ============================================================ */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border border-gray-100 relative">
                        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100">
                            <FaTrash />
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900">Supprimer cet utilisateur ?</h3>
                        <p className="text-xs text-gray-500 mt-2 mb-6">
                            Voulez-vous vraiment supprimer définitivement le compte de <strong className="text-gray-800">"{deletingUser.nom}"</strong> ({deletingUser.email}) ?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingUser(null)}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={deletingUserLoading}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                            >
                                {deletingUserLoading ? "Suppression..." : "Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
                MODAL CONFIRMATION SUPPRESSION CATÉGORIE
            ============================================================ */}
            {deletingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border border-gray-100 relative">
                        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100">
                            <FaTrash />
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900">Supprimer cette catégorie ?</h3>
                        <p className="text-xs text-gray-500 mt-2 mb-6">
                            Voulez-vous vraiment supprimer la catégorie <strong className="text-gray-800">"{deletingCategory.nom}"</strong> ?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingCategory(null)}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                disabled={deletingCategoryLoading}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                            >
                                {deletingCategoryLoading ? "Suppression..." : "Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
                MODAL DÉTAILS JSON AUDIT LOG
            ============================================================ */}
            {selectedAuditLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 relative border border-gray-100">
                        <button
                            onClick={() => setSelectedAuditLog(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                <FaHistory />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900">Détail du Journal d'Audit #{selectedAuditLog.id}</h3>
                                <p className="text-xs text-gray-500">Action : {selectedAuditLog.action} • Table : {selectedAuditLog.table_nom || selectedAuditLog.table}</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            {selectedAuditLog.anciennes_valeurs && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-1">Anciennes Valeurs :</h4>
                                    <pre className="bg-gray-900 text-amber-400 p-3 rounded-xl overflow-x-auto text-[11px] font-mono">
                                        {JSON.stringify(selectedAuditLog.anciennes_valeurs, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedAuditLog.nouvelles_valeurs && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-1">Nouvelles Valeurs :</h4>
                                    <pre className="bg-gray-900 text-emerald-400 p-3 rounded-xl overflow-x-auto text-[11px] font-mono">
                                        {JSON.stringify(selectedAuditLog.nouvelles_valeurs, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {!selectedAuditLog.anciennes_valeurs && !selectedAuditLog.nouvelles_valeurs && (
                                <p className="text-gray-400 italic py-4">Aucune donnée supplémentaire enregistrée pour ce log.</p>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 text-right">
                            <button
                                onClick={() => setSelectedAuditLog(null)}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
