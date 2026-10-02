import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getOffres, getCategories } from "../../services/offreService";
import { getMesCommandes, creerCommande, downloadFacture, updateStatutCommande } from "../../services/commandeService";
import { payerCommande } from "../../services/paiementService";
import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";
import {
    FaLeaf, FaStore, FaShoppingBag, FaClock, FaCheckCircle, FaSearch,
    FaFilePdf, FaBox, FaCreditCard, FaComments, FaExclamationCircle,
    FaShoppingCart, FaTimes, FaPlus, FaMinus, FaUser,
    FaEye, FaRegCommentDots, FaUsers, FaFileInvoice, FaCog,
    FaSignOutAlt, FaBell, FaCircle
} from "react-icons/fa";

export default function AcheteurDashboard() {
    const { user, confirmLogout } = useAuth();
    const navigate = useNavigate();

    // Onglet actif : "offres" (Catalogue disponible) ou "commandes" (Mes Achats)
    const [activeTab, setActiveTab] = useState("offres");

    // Offres & Filtres
    const [offres, setOffres] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingOffres, setLoadingOffres] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("toutes");

    // Commandes Acheteur
    const [commandes, setCommandes] = useState([]);
    const [loadingCommandes, setLoadingCommandes] = useState(true);
    const [payingId, setPayingId] = useState(null);
    const [downloadingPdfId, setDownloadingPdfId] = useState(null);
    const [erreurPaiement, setErreurPaiement] = useState(null);

    // Modal de Commande
    const [selectedOffre, setSelectedOffre] = useState(null);
    const [quantiteCommande, setQuantiteCommande] = useState(1);
    const [submittingCommande, setSubmittingCommande] = useState(false);
    const [erreurCommande, setErreurCommande] = useState("");
    const [succesMsg, setSuccesMsg] = useState("");

    // Charger les offres et catégories
    const fetchOffresData = async () => {
        try {
            setLoadingOffres(true);
            const [offresData, catsData] = await Promise.all([
                getOffres(),
                getCategories()
            ]);
            setOffres(Array.isArray(offresData) ? offresData : []);
            setCategories(Array.isArray(catsData) ? catsData : []);
        } catch (err) {
            console.error("Erreur chargement offres acheteur :", err);
        } finally {
            setLoadingOffres(false);
        }
    };

    // Charger les commandes
    const fetchCommandesData = async () => {
        try {
            setLoadingCommandes(true);
            const data = await getMesCommandes();
            setCommandes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur chargement commandes acheteur :", err);
        } finally {
            setLoadingCommandes(false);
        }
    };

    useEffect(() => {
        fetchOffresData();
        fetchCommandesData();
    }, []);

    // Helper pour construire les URL d'images
    const getImageUrl = (img) => {
        return resolveImageUrl(img, "SenAgri");
    };

    // Filtrage des offres
    const offresFiltrees = offres.filter((offre) => {
        const matchSearch = (offre.nom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (offre.description || "").toLowerCase().includes(searchQuery.toLowerCase());

        const catId = offre.categorie?.id || offre.categorie_id;
        const matchCategory = selectedCategory === "toutes" || String(catId) === String(selectedCategory);

        return matchSearch && matchCategory && (offre.est_disponible !== false);
    });

    const handleOpenOrderModal = (offre) => {
        setSelectedOffre(offre);
        setQuantiteCommande(1);
        setErreurCommande("");
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOffre) return;

        if (quantiteCommande <= 0) {
            setErreurCommande("Veuillez sélectionner au moins 1 unité.");
            return;
        }

        if (quantiteCommande > selectedOffre.quantite_disponible) {
            setErreurCommande(`La quantité demandée dépasse le stock disponible (${selectedOffre.quantite_disponible} ${selectedOffre.unite}).`);
            return;
        }

        setSubmittingCommande(true);
        setErreurCommande("");

        try {
            await creerCommande({
                offre_id: selectedOffre.id,
                quantite: Number(quantiteCommande),
            });

            setSuccesMsg(`Commande enregistrée avec succès pour ${selectedOffre.nom} !`);
            setSelectedOffre(null);

            await fetchCommandesData();
            setActiveTab("commandes");

            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur création commande :", err);
            const msg = err.response?.data?.message || "Impossible de passer cette commande pour le moment.";
            setErreurCommande(msg);
        } finally {
            setSubmittingCommande(false);
        }
    };

    const handlePayer = async (commandeId) => {
        setPayingId(commandeId);
        setErreurPaiement(null);

        try {
            const res = await payerCommande(commandeId);
            if (res.url) {
                window.location.href = res.url;
            } else {
                setErreurPaiement("Lien de paiement indisponible pour le moment.");
            }
        } catch (err) {
            console.error("Erreur paiement :", err);
            const msg = err.response?.data?.message || "Impossible d'initier le paiement en ligne.";
            setErreurPaiement(msg);
            setTimeout(() => setErreurPaiement(null), 4000);
        } finally {
            setPayingId(null);
        }
    };

    const handleDownloadPdf = async (cmdId) => {
        try {
            setDownloadingPdfId(cmdId);
            setErreurPaiement(null);
            await downloadFacture(cmdId);
            setSuccesMsg(`Facture pour la commande #${cmdId} téléchargée.`);
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur téléchargement facture :", err);
            setErreurPaiement("Erreur lors du téléchargement de la facture PDF.");
            setTimeout(() => setErreurPaiement(null), 4000);
        } finally {
            setDownloadingPdfId(null);
        }
    };

    const handleUpdateStatut = async (cmdId, statut) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return;
        try {
            await updateStatutCommande(cmdId, statut);
            setSuccesMsg(`La commande a été annulée.`);
            setTimeout(() => setSuccesMsg(""), 4000);
            fetchCommandesData();
        } catch (err) {
            console.error("Erreur annulation commande :", err);
            setErreurPaiement("Impossible d'annuler la commande.");
            setTimeout(() => setErreurPaiement(null), 4000);
        }
    };

    const handleLogout = () => {
        confirmLogout();
    };

    const getStatusBadge = (statut) => {
        switch (statut) {
            case "en_attente":
                return <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">En attente</span>;
            case "confirmee":
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">Confirmée</span>;
            case "en_cours":
            case "expediee":
                return <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-full border border-purple-200">Expédiée</span>;
            case "payee":
                return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">Payée</span>;
            case "livree":
                return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">Livrée</span>;
            case "annulee":
                return <span className="px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-full border border-red-200">Annulée</span>;
            default:
                return <span className="px-3 py-1 bg-gray-50 text-gray-700 font-bold text-xs rounded-full border border-gray-200">{statut}</span>;
        }
    };

    const countEnCours = commandes.filter((c) => c.statut === "en_attente" || c.statut === "confirmee" || c.statut === "expediee").length;
    const countTerminees = commandes.filter((c) => c.statut === "livree" || c.statut === "payee" || c.est_payee).length;
    const currentAvatar = user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "Acheteur")}&background=138040&color=fff`;

    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">

            {/* ===== SIDEBAR ===== */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex-col justify-between hidden md:flex shrink-0">
                <div>
                    {/* Logo SenAgri identique */}
                    <div className="px-6 pt-6 pb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <FaLeaf className="text-[#138040] text-[26px]" />
                            <div>
                                <p className="text-[18px] font-extrabold text-[#138040] leading-none tracking-tight">SenAgri</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">Marché Agricole B2B</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="px-4">
                        <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Espace Acheteur</p>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab("offres")}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-all text-left ${
                                    activeTab === "offres"
                                        ? "bg-[#138040] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                <FaStore className={`${activeTab === "offres" ? "text-white/80" : "text-gray-400"} text-[14px] shrink-0`} />
                                Offres & Catalogue
                            </button>

                            <button
                                onClick={() => setActiveTab("commandes")}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-all text-left ${
                                    activeTab === "commandes"
                                        ? "bg-[#138040] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                <FaShoppingBag className={`${activeTab === "commandes" ? "text-white/80" : "text-gray-400"} text-[14px] shrink-0`} />
                                Mes Commandes
                            </button>

                            <Link
                                to="/messages"
                                className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors"
                            >
                                <span className="flex items-center gap-3">
                                    <FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" />
                                    Messagerie
                                </span>
                                <span className="w-2 h-2 bg-[#138040] rounded-full"></span>
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Bottom Nav */}
                <div className="px-4 pb-6 border-t border-gray-100 pt-4 space-y-1">
                    <Link
                        to="/profil"
                        className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                    >
                        <FaCog className="text-gray-400 text-[14px] shrink-0" />
                        Paramètres
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-[#c0392b] hover:bg-red-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                    >
                        <FaSignOutAlt className="text-[#c0392b] text-[14px] shrink-0" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Sticky Header */}
                <header className="bg-white/80 backdrop-blur sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
                    <span className="bg-[#e4f5ed] text-[#138040] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#138040] rounded-full inline-block"></span>
                        Sénégal •
                    </span>
                    <div className="flex items-center gap-5">
                        <button className="relative text-gray-500 hover:text-gray-800">
                            <FaBell className="text-xl" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f08c35] border-2 border-white rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-gray-900 leading-none">{user?.nom || "Acheteur"}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Acheteur B2B / Grossiste</p>
                            </div>
                            <img
                                src={currentAvatar}
                                alt="avatar"
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#e4f5ed]"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1280px] w-full mx-auto space-y-6">

                    {/* Hero Banner */}
                    <div className="bg-gradient-to-r from-[#0d592a] via-[#106b33] to-[#147a3c] rounded-[22px] p-8 text-white relative shadow-sm overflow-hidden">
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-3 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 bg-white rounded-full inline-block"></span>
                                ESPACE ACHETEUR / CLIENT B2B
                            </span>
                            <h1 className="text-[30px] font-black tracking-tight mb-2">
                                Bienvenue, {user?.nom || "Acheteur"} 👋
                            </h1>
                            <p className="text-white/80 text-[13px] font-medium max-w-2xl leading-relaxed">
                                Explorez les récoltes disponibles directement auprès des producteurs et passez vos commandes en toute sécurité.
                            </p>
                        </div>
                    </div>

                    {/* Cartes Statistiques (4 colonnes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#eef5fc] text-[#2563eb] flex items-center justify-center text-xl shrink-0">
                                <FaStore />
                            </div>
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Offres disponibles</p>
                                <h3 className="text-[26px] font-black text-gray-900 leading-tight mt-0.5">{offresFiltrees.length}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#e6f7ef] text-[#138040] flex items-center justify-center text-xl shrink-0">
                                <FaShoppingBag />
                            </div>
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Mes Commandes</p>
                                <h3 className="text-[26px] font-black text-gray-900 leading-tight mt-0.5">{commandes.length}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#fff4eb] text-[#ea580c] flex items-center justify-center text-xl shrink-0">
                                <FaClock />
                            </div>
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">En traitement</p>
                                <h3 className="text-[26px] font-black text-gray-900 leading-tight mt-0.5">{countEnCours}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#e6f4f2] text-[#0d9488] flex items-center justify-center text-xl shrink-0">
                                <FaCheckCircle />
                            </div>
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Achats validés</p>
                                <h3 className="text-[26px] font-black text-gray-900 leading-tight mt-0.5">{countTerminees}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab("offres")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold transition-all ${
                                activeTab === "offres"
                                    ? "bg-white text-[#138040] border border-gray-200 shadow-sm"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <FaStore className="text-[12px]" />
                            Offres & Catalogue ({offresFiltrees.length})
                        </button>

                        <button
                            onClick={() => setActiveTab("commandes")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold transition-all ${
                                activeTab === "commandes"
                                    ? "bg-white text-[#138040] border border-gray-200 shadow-sm"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <FaShoppingBag className="text-[12px]" />
                            Mes Commandes ({commandes.length})
                            {countEnCours > 0 && (
                                <span className="bg-[#f08c35] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                    {countEnCours}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Flash Message */}
                    {succesMsg && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-[14px] flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-green-600 text-base shrink-0" />
                                <p className="text-[13px] font-bold text-green-800">{succesMsg}</p>
                            </div>
                            <button onClick={() => setSuccesMsg("")} className="text-green-700 hover:text-green-900">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    {/* ============================================================
                        VUE 1 : CATALOGUE DES OFFRES
                    ============================================================ */}
                    {activeTab === "offres" && (
                        <div className="space-y-6">
                            {/* Barre de Recherche et Filtres */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="relative flex-1 max-w-xl">
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Rechercher une récolte (Oignons, Tomates, Riz...)"
                                            className="w-full pl-11 pr-4 py-3 bg-[#f0f4fc] rounded-[14px] text-[13px] border border-transparent focus:border-[#138040] focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <span className="text-[12px] text-gray-500 font-medium">
                                        Affichage de <strong className="text-gray-900">{offresFiltrees.length}</strong> offre(s) agricole(s)
                                    </span>
                                </div>

                                {/* Pills Catégories */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setSelectedCategory("toutes")}
                                        className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold transition-all ${
                                            selectedCategory === "toutes"
                                                ? "bg-[#0d592a] text-white shadow-sm"
                                                : "bg-[#eef2fa] text-[#4b5563] hover:bg-gray-200"
                                        }`}
                                    >
                                        Toutes les catégories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold transition-all ${
                                                String(selectedCategory) === String(cat.id)
                                                    ? "bg-[#0d592a] text-white shadow-sm"
                                                    : "bg-[#eef2fa] text-[#4b5563] hover:bg-gray-200"
                                            }`}
                                        >
                                            {cat.nom}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Grille des Offres (4 colonnes comme la maquette) */}
                            {loadingOffres ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#138040] border-t-transparent mx-auto mb-2"></div>
                                    <p className="text-[12px] font-semibold text-gray-400">Chargement des récoltes disponibles...</p>
                                </div>
                            ) : offresFiltrees.length === 0 ? (
                                <div className="bg-white rounded-[18px] border border-gray-100 p-12 text-center">
                                    <p className="text-4xl mb-3">🌾</p>
                                    <h3 className="text-[16px] font-bold text-gray-800">Aucune récolte disponible actuellement</h3>
                                    <p className="text-[12px] text-gray-400 mt-1">Ajustez vos filtres ou revenez plus tard.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {offresFiltrees.map((offre) => {
                                        const imagePrincipale = offre.images && offre.images.length > 0
                                            ? getImageUrl(offre.images[0])
                                            : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

                                        const vendeurNom = offre.vendeur?.nom || offre.vendeur?.name || "Producteur";
                                        const stockDispo = Number(offre.quantite_disponible || 0);

                                        return (
                                            <div
                                                key={offre.id}
                                                className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
                                            >
                                                {/* Image avec Badge Catégorie */}
                                                <div className="relative h-44 bg-gray-100 overflow-hidden">
                                                    <img
                                                        src={imagePrincipale}
                                                        alt={offre.nom}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"; }}
                                                    />
                                                    <span className="absolute top-3 left-3 bg-[#138040] text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-sm">
                                                        {offre.categorie?.nom || "Agricole"}
                                                    </span>
                                                </div>

                                                {/* Détails Carte */}
                                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                                    <div>
                                                        <h3 className="text-[17px] font-extrabold text-gray-900 tracking-tight leading-tight line-clamp-1 group-hover:text-[#138040] transition-colors">
                                                            {offre.nom}
                                                        </h3>
                                                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                                                            {offre.description || "Produit agricole de première récolte garanti direct producteur."}
                                                        </p>
                                                    </div>

                                                    {/* Bloc Infos Producteur & Stock */}
                                                    <div className="bg-[#f8f9fc] rounded-[12px] p-2.5 text-[11px] space-y-1 border border-gray-50">
                                                        <div className="flex items-center justify-between text-gray-500">
                                                            <span>Producteur :</span>
                                                            <span className="font-bold text-gray-900 flex items-center gap-1 truncate max-w-[130px]">
                                                                <FaUser className="text-[#138040] text-[9px] shrink-0" />
                                                                {vendeurNom}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-gray-500">
                                                            <span>Stock disponible :</span>
                                                            <span className="font-bold text-[#138040]">
                                                                {stockDispo} {offre.unite || "Kg"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Prix & Boutons d'Action */}
                                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">
                                                                Prix unitaire
                                                            </span>
                                                            <span className="text-[15px] font-black text-gray-900 leading-none">
                                                                {Number(offre.prix_unitaire).toLocaleString("fr-FR")}
                                                            </span>
                                                            <span className="text-[10px] font-extrabold text-[#138040] block mt-0.5">
                                                                FCFA
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <Link
                                                                to={`/offres/${offre.id}`}
                                                                className="w-8 h-8 rounded-[9px] bg-[#eef3fb] text-[#3b82f6] hover:bg-blue-100 flex items-center justify-center transition-colors"
                                                                title="Voir la fiche détaillée"
                                                            >
                                                                <FaEye className="text-[12px]" />
                                                            </Link>

                                                            <button
                                                                onClick={() => handleOpenOrderModal(offre)}
                                                                disabled={stockDispo <= 0}
                                                                className={`px-3 py-2 rounded-[9px] text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm transition-all ${
                                                                    stockDispo > 0
                                                                        ? "bg-[#0d592a] hover:bg-[#09401e] text-white cursor-pointer"
                                                                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                                                }`}
                                                            >
                                                                <FaShoppingCart className="text-[11px]" />
                                                                Commander
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================
                        VUE 2 : MES COMMANDES D'ACHATS
                    ============================================================ */}
                    {activeTab === "commandes" && (
                        <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[18px] font-extrabold text-gray-900 mb-0.5">Mes Commandes d'achats</h2>
                                    <p className="text-[12px] text-gray-500 font-medium">Suivi de vos règlements et gestion des factures PDF</p>
                                </div>
                            </div>

                            {erreurPaiement && (
                                <div className="m-6 bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-center gap-3">
                                    <FaExclamationCircle className="text-red-600 shrink-0" />
                                    <p className="text-[12px] font-bold text-red-800">{erreurPaiement}</p>
                                </div>
                            )}

                            {loadingCommandes ? (
                                <div className="py-16 text-center text-[12px] text-gray-400 font-semibold">
                                    Chargement de vos commandes...
                                </div>
                            ) : commandes.length === 0 ? (
                                <div className="py-16 px-6 text-center">
                                    <p className="text-4xl mb-3">🛒</p>
                                    <h3 className="text-[15px] font-bold text-gray-800">Vous n'avez pas encore passé de commande</h3>
                                    <p className="text-gray-400 text-[12px] mt-1 mb-5">Explorez les offres du catalogue et passez votre première commande.</p>
                                    <button
                                        onClick={() => setActiveTab("offres")}
                                        className="inline-flex items-center gap-2 bg-[#138040] hover:bg-[#0e6530] text-white font-bold px-5 py-2.5 rounded-[12px] text-[12px] transition-colors"
                                    >
                                        <FaStore /> Voir le catalogue
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-[13px]">
                                        <thead>
                                            <tr className="bg-[#f8f9fc] text-gray-400 font-extrabold uppercase text-[9px] tracking-[0.13em] border-b border-gray-100">
                                                <th className="py-4 px-6">Réf / Offre</th>
                                                <th className="py-4 px-6">Vendeur</th>
                                                <th className="py-4 px-6">Quantité</th>
                                                <th className="py-4 px-6">Prix Total</th>
                                                <th className="py-4 px-6">Statut</th>
                                                <th className="py-4 px-6 text-right">Actions / Règlement</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {commandes.map((cmd) => (
                                                <tr key={cmd.id} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="py-4 px-6 font-semibold text-gray-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-[10px] bg-[#e4f5ed] text-[#138040] flex items-center justify-center font-bold">
                                                                <FaBox />
                                                            </div>
                                                            <div>
                                                                <span className="block font-bold text-gray-900">
                                                                    {cmd.offre?.nom || `Commande #${cmd.id}`}
                                                                </span>
                                                                <span className="text-[11px] text-gray-400">
                                                                    N° #{cmd.id} • {new Date(cmd.date_commande || cmd.created_at).toLocaleDateString("fr-FR")}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6 text-gray-700 font-medium">
                                                        {cmd.vendeur?.nom || cmd.offre?.vendeur?.nom || "Producteur"}
                                                    </td>

                                                    <td className="py-4 px-6 text-gray-900 font-bold">
                                                        {cmd.quantite} {cmd.offre?.unite || ""}
                                                    </td>

                                                    <td className="py-4 px-6 text-[#138040] font-black">
                                                        {Number(cmd.prix_total).toLocaleString("fr-FR")} FCFA
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        {getStatusBadge(cmd.statut)}
                                                    </td>

                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {(cmd.vendeur?.id || cmd.offre?.vendeur?.id) && (
                                                                <button
                                                                    onClick={() => navigate(`/messages?user=${cmd.vendeur?.id || cmd.offre.vendeur.id}&offre=${cmd.offre?.id}`)}
                                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#138040] bg-[#f0faf5] hover:bg-[#e4f5ed] px-3 py-1.5 rounded-[9px] border border-[#d5eddf] transition-colors"
                                                                    title="Discuter avec le vendeur"
                                                                >
                                                                    <FaComments /> Chat
                                                                </button>
                                                            )}

                                                            {Boolean(cmd.est_payee || cmd.statut === "payee" || cmd.paiement?.statut === "reussi") ? (
                                                                <button
                                                                    disabled
                                                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-[9px] cursor-not-allowed"
                                                                >
                                                                    <FaCheckCircle className="text-emerald-600" /> Payée
                                                                </button>
                                                            ) : cmd.statut !== "annulee" && (
                                                                <button
                                                                    onClick={() => handlePayer(cmd.id)}
                                                                    disabled={payingId === cmd.id}
                                                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#138040] hover:bg-[#0e6530] px-3 py-1.5 rounded-[9px] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                                                                >
                                                                    {payingId === cmd.id ? (
                                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                                                    ) : (
                                                                        <FaCreditCard />
                                                                    )}
                                                                    Payer
                                                                </button>
                                                            )}

                                                            {cmd.statut === "en_attente" && (
                                                                <button
                                                                    onClick={() => handleUpdateStatut(cmd.id, "annulee")}
                                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-red-700 bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-[9px] transition-colors"
                                                                >
                                                                    <FaTimes /> Annuler
                                                                </button>
                                                            )}

                                                            {(cmd.est_payee || cmd.statut === "payee" || cmd.paiement?.statut === "reussi") && (
                                                                <button
                                                                    onClick={() => handleDownloadPdf(cmd.id)}
                                                                    disabled={downloadingPdfId === cmd.id}
                                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-[9px] transition-colors"
                                                                >
                                                                    {downloadingPdfId === cmd.id ? (
                                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-600 border-t-transparent"></div>
                                                                    ) : (
                                                                        <FaFilePdf />
                                                                    )}
                                                                    PDF
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* Modal de Commande Interactif */}
            {selectedOffre && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[22px] shadow-2xl max-w-lg w-full p-8 border border-gray-100 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedOffre(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes className="text-base" />
                        </button>

                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                            <img
                                src={getImageUrl(selectedOffre.images?.[0])}
                                alt={selectedOffre.nom}
                                className="w-16 h-16 rounded-[14px] object-cover border border-gray-200"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"; }}
                            />
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#138040] bg-[#e4f5ed] px-2.5 py-0.5 rounded-full">
                                    {selectedOffre.categorie?.nom || "Produit Agricole"}
                                </span>
                                <h3 className="text-[17px] font-extrabold text-gray-900 mt-1 line-clamp-1">{selectedOffre.nom}</h3>
                                <p className="text-[12px] text-gray-500">Stock disponible : {selectedOffre.quantite_disponible} {selectedOffre.unite}</p>
                            </div>
                        </div>

                        {erreurCommande && (
                            <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-[12px] flex items-center gap-2">
                                <FaExclamationCircle className="text-red-500 shrink-0" />
                                <p className="text-[12px] font-bold text-red-700">{erreurCommande}</p>
                            </div>
                        )}

                        <form onSubmit={handleOrderSubmit} className="mt-6 space-y-6">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                    Quantité à commander ({selectedOffre.unite})
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setQuantiteCommande(prev => Math.max(1, prev - 1))}
                                        className="w-12 h-12 rounded-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                                    >
                                        <FaMinus />
                                    </button>

                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedOffre.quantite_disponible}
                                        value={quantiteCommande}
                                        onChange={(e) => setQuantiteCommande(Number(e.target.value))}
                                        className="flex-grow text-center py-3 px-4 rounded-[12px] border border-gray-200 font-extrabold text-lg text-gray-900 outline-none focus:border-[#138040] transition-colors"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setQuantiteCommande(prev => Math.min(selectedOffre.quantite_disponible, prev + 1))}
                                        className="w-12 h-12 rounded-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#f0faf5] p-4 rounded-[14px] border border-[#d5eddf] space-y-2">
                                <div className="flex justify-between text-[12px] text-gray-600 font-medium">
                                    <span>Prix unitaire :</span>
                                    <strong className="text-gray-900">{Number(selectedOffre.prix_unitaire).toLocaleString("fr-FR")} FCFA / {selectedOffre.unite}</strong>
                                </div>
                                <div className="flex justify-between text-[12px] text-gray-600 font-medium">
                                    <span>Quantité sélectionnée :</span>
                                    <strong className="text-gray-900">{quantiteCommande} {selectedOffre.unite}</strong>
                                </div>
                                <div className="pt-2 border-t border-[#d5eddf] flex justify-between items-baseline">
                                    <span className="font-extrabold text-[13px] text-gray-900">Total à payer :</span>
                                    <span className="text-xl font-black text-[#138040]">
                                        {(quantiteCommande * Number(selectedOffre.prix_unitaire)).toLocaleString("fr-FR")} FCFA
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOffre(null)}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[12px] text-[13px] transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingCommande}
                                    className={`flex-1 py-3 px-4 bg-[#138040] hover:bg-[#0e6530] text-white font-extrabold rounded-[12px] text-[13px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                                        submittingCommande ? "opacity-75 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {submittingCommande ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Validation...
                                        </>
                                    ) : (
                                        "Confirmer la commande"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

