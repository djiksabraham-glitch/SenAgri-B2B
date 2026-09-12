import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { getOffres, getCategories } from "../../services/offreService";
import { getMesCommandes, creerCommande, downloadFacture } from "../../services/commandeService";
import { payerCommande } from "../../services/paiementService";
import {
    FaShoppingBag, FaClock, FaCheckCircle, FaSearch,
    FaFilePdf, FaBox, FaCreditCard, FaComments, FaExclamationCircle,
    FaStore, FaFilter, FaShoppingCart, FaTimes, FaPlus, FaMinus,
    FaUserCheck, FaTag, FaCoins, FaWeightHanging, FaArrowRight, FaEye
} from "react-icons/fa";

export default function AcheteurDashboard() {
    const { user } = useAuth();
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

    const handleDownloadPdf = async (cmdId) => {
        try {
            setDownloadingPdfId(cmdId);
            setErreurPaiement(null);
            await downloadFacture(cmdId);
            setSuccesMsg(`Facture pour la commande #${cmdId} téléchargée.`);
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur lors du téléchargement de la facture :", err);
            setErreurPaiement("Erreur lors du téléchargement de la facture PDF.");
            setTimeout(() => setErreurPaiement(null), 4000);
        } finally {
            setDownloadingPdfId(null);
        }
    };

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

    // Filtrage des offres
    const offresFiltrees = offres.filter((offre) => {
        const matchSearch = (offre.nom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (offre.description || "").toLowerCase().includes(searchQuery.toLowerCase());

        const catId = offre.categorie?.id || offre.categorie_id;
        const matchCategory = selectedCategory === "toutes" || String(catId) === String(selectedCategory);

        // N'afficher que les offres disponibles du catalogue
        return matchSearch && matchCategory && (offre.est_disponible !== false);
    });

    // Gestion de l'ouverture du Modal de commande
    const handleOpenOrderModal = (offre) => {
        setSelectedOffre(offre);
        setQuantiteCommande(1);
        setErreurCommande("");
    };

    // Soumission de commande
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

            // Recharger les commandes et basculer sur l'onglet Mes Commandes
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

    // Règlement de commande via PayDunya (Wave, Orange Money)
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

    // Badges de statut commande
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            {/* En-tête Espace Acheteur */}
            <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-700 text-white py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="px-3 py-1 bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-200">
                            Espace Acheteur / Client B2B
                        </span>
                        <h1 className="text-3xl font-extrabold mt-2">
                            Bienvenue, {user?.nom || "Acheteur"} 👋
                        </h1>
                        <p className="text-emerald-100 text-sm mt-1">
                            Explorez les récoltes disponibles directement auprès des producteurs et passez vos commandes.
                        </p>
                    </div>

                    <Link
                        to="/messages"
                        className="inline-flex items-center gap-2 bg-white text-emerald-900 font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-emerald-50 transition-all text-sm"
                    >
                        <FaComments className="text-emerald-700 text-base" />
                        Messagerie B2B
                    </Link>
                </div>
            </div>

            {/* Contenu Principal */}
            <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">

                {/* Cartes de Statistiques */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl flex-shrink-0">
                            <FaStore />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Offres disponibles</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{offresFiltrees.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
                            <FaShoppingBag />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Mes Commandes</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{commandes.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
                            <FaClock />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">En traitement</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{countEnCours}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl flex-shrink-0">
                            <FaCheckCircle />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Achats validés</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{countTerminees}</h3>
                        </div>
                    </div>
                </div>

                {/* Notification Flash Succès */}
                {succesMsg && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                            <p className="text-sm font-semibold text-green-800">{succesMsg}</p>
                        </div>
                        <button onClick={() => setSuccesMsg("")} className="text-green-700 hover:text-green-900">
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Onglets d'action */}
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit mb-8 border border-gray-200">
                    <button
                        onClick={() => setActiveTab("offres")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === "offres"
                                ? "bg-white text-green-800 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        <FaStore className="text-base" />
                        Offres & Catalogue ({offresFiltrees.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("commandes")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === "commandes"
                                ? "bg-white text-green-800 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        <FaShoppingBag className="text-base" />
                        Mes Commandes ({commandes.length})
                        {countEnCours > 0 && (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                {countEnCours}
                            </span>
                        )}
                    </button>
                </div>

                {/* ============================================================
                    ONGLET 1 : CATALOGUE DES OFFRES DISPONIBLES
                ============================================================ */}
                {activeTab === "offres" && (
                    <div className="space-y-6">

                        {/* Barre de Recherche et Filtres par Catégorie */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-grow max-w-lg">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaSearch />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher une récolte (Oignons, Tomates, Riz...)"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="text-xs text-gray-500 font-semibold">
                                    Affichage de <strong className="text-gray-900">{offresFiltrees.length}</strong> offre(s) agricole(s)
                                </div>
                            </div>

                            {/* Badges de catégories */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => setSelectedCategory("toutes")}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        selectedCategory === "toutes"
                                            ? "bg-green-700 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    Toutes les catégories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            String(selectedCategory) === String(cat.id)
                                                ? "bg-green-700 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {cat.nom}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grille d'offres */}
                        {loadingOffres ? (
                            <div className="py-20 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3"></div>
                                <p className="text-xs font-semibold text-gray-500">Chargement des offres du catalogue...</p>
                            </div>
                        ) : offresFiltrees.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                <p className="text-4xl mb-3">🌾</p>
                                <h3 className="text-lg font-bold text-gray-800">Aucune offre ne correspond à vos critères</h3>
                                <p className="text-xs text-gray-500 mt-1">Essayez d'ajuster votre recherche ou votre filtre de catégorie.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {offresFiltrees.map((offre) => {
                                    const imagePrincipale = offre.images && offre.images.length > 0
                                        ? getImageUrl(offre.images[0])
                                        : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

                                    const vendeurNom = offre.vendeur?.nom || offre.vendeur?.name || "Producteur local";
                                    const stockDispo = Number(offre.quantite_disponible || 0);

                                    return (
                                        <div key={offre.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                                            
                                            {/* Image */}
                                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                                <img
                                                    src={imagePrincipale}
                                                    alt={offre.nom}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"; }}
                                                />
                                                <span className="absolute top-3 left-3 bg-green-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                                                    {offre.categorie?.nom || "Agricole"}
                                                </span>
                                            </div>

                                            {/* Corps de la carte */}
                                            <div className="p-5 flex-grow flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-extrabold text-base text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                                                        {offre.nom}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {offre.description || "Offre agricole garantie directe producteur."}
                                                    </p>

                                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                                        <span className="text-gray-500 font-semibold">Producteur :</span>
                                                        <span className="font-bold text-gray-800 flex items-center gap-1">
                                                            <FaUserCheck className="text-green-600 text-xs" />
                                                            {vendeurNom}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between text-xs">
                                                        <span className="text-gray-500 font-semibold">Stock disponible :</span>
                                                        <span className={`font-bold ${stockDispo > 0 ? "text-green-700" : "text-red-500"}`}>
                                                            {stockDispo} {offre.unite || "Kg"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Prix & Boutons d'action */}
                                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                                    <div>
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Prix unitaire</span>
                                                        <span className="text-lg font-black text-green-700">
                                                            {Number(offre.prix_unitaire).toLocaleString("fr-FR")} <span className="text-xs">FCFA</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/offres/${offre.id}`}
                                                            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                                                            title="Voir la fiche détaillée"
                                                        >
                                                            <FaEye />
                                                        </Link>

                                                        <button
                                                            onClick={() => handleOpenOrderModal(offre)}
                                                            disabled={stockDispo <= 0}
                                                            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md transition-all ${
                                                                stockDispo > 0
                                                                    ? "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg cursor-pointer"
                                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                                            }`}
                                                        >
                                                            <FaShoppingCart />
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
                    ONGLET 2 : MES COMMANDES (HISTORIQUE ET REGLEMENT)
                ============================================================ */}
                {activeTab === "commandes" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Mes Commandes d'achats</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Suivi de vos règlements et gestion des factures PDF</p>
                            </div>
                        </div>

                        {/* Erreur de paiement */}
                        {erreurPaiement && (
                            <div className="m-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3">
                                <FaExclamationCircle className="text-red-500 text-lg flex-shrink-0" />
                                <p className="text-xs font-semibold text-red-700">{erreurPaiement}</p>
                            </div>
                        )}

                        {loadingCommandes ? (
                            <div className="py-16 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3"></div>
                                <p className="text-xs text-gray-500 font-semibold">Chargement de vos commandes...</p>
                            </div>
                        ) : commandes.length === 0 ? (
                            <div className="py-16 px-6 text-center">
                                <p className="text-4xl mb-3">🛒</p>
                                <h3 className="text-lg font-bold text-gray-800">Vous n'avez pas encore passé de commande</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">Explorez les offres du catalogue ci-dessus et passez votre première commande.</p>
                                <button
                                    onClick={() => setActiveTab("offres")}
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                                >
                                    <FaStore /> Voir le catalogue
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
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
                                            <tr key={cmd.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-4 px-6 font-semibold text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 flex items-center justify-center font-bold">
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

                                                <td className="py-4 px-6 text-green-700 font-black">
                                                    {Number(cmd.prix_total).toLocaleString("fr-FR")} FCFA
                                                </td>

                                                <td className="py-4 px-6">
                                                    {getStatusBadge(cmd.statut)}
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Bouton Contacter Vendeur */}
                                                        {(cmd.vendeur?.id || cmd.offre?.vendeur?.id) && (
                                                            <button
                                                                onClick={() => navigate(`/messages?user=${cmd.vendeur?.id || cmd.offre.vendeur.id}&offre=${cmd.offre?.id}`)}
                                                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                                                                title="Discuter avec le vendeur"
                                                            >
                                                                <FaComments /> Chat
                                                            </button>
                                                        )}

                                                        {/* Bouton Paiement PayDunya / Statut de paiement */}
                                                        {Boolean(cmd.est_payee || cmd.statut === "payee" || cmd.paiement?.statut === "reussi") ? (
                                                            <button
                                                                disabled
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg cursor-not-allowed opacity-80"
                                                                title="Cette commande a déjà été réglée"
                                                            >
                                                                <FaCheckCircle className="text-emerald-600" />
                                                                Payée
                                                            </button>
                                                        ) : cmd.statut !== "annulee" && (
                                                            <button
                                                                onClick={() => handlePayer(cmd.id)}
                                                                disabled={payingId === cmd.id}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                                                                title="Payer via Wave, Orange Money ou Carte"
                                                            >
                                                                {payingId === cmd.id ? (
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                                                ) : (
                                                                    <FaCreditCard />
                                                                )}
                                                                Payer
                                                            </button>
                                                        )}

                                                        {/* Bouton Télécharger Facture PDF */}
                                                        <button
                                                            onClick={() => handleDownloadPdf(cmd.id)}
                                                            disabled={downloadingPdfId === cmd.id}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200 cursor-pointer disabled:opacity-60"
                                                            title="Télécharger la facture PDF"
                                                        >
                                                            {downloadingPdfId === cmd.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-600 border-t-transparent"></div>
                                                            ) : (
                                                                <FaFilePdf />
                                                            )}
                                                            PDF
                                                        </button>
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

            </main>

            {/* ============================================================
                MODAL INTERACTIF DE COMMANDE B2B
            ============================================================ */}
            {selectedOffre && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-gray-100 relative animate-in fade-in zoom-in duration-200">
                        
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
                                className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"; }}
                            />
                            <div>
                                <span className="text-[10px] uppercase font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                    {selectedOffre.categorie?.nom || "Produit Agricole"}
                                </span>
                                <h3 className="text-lg font-extrabold text-gray-900 mt-1 line-clamp-1">{selectedOffre.nom}</h3>
                                <p className="text-xs text-gray-500">Stock : {selectedOffre.quantite_disponible} {selectedOffre.unite}</p>
                            </div>
                        </div>

                        {erreurCommande && (
                            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl flex items-center gap-2">
                                <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                                <p className="text-xs font-semibold text-red-700">{erreurCommande}</p>
                            </div>
                        )}

                        <form onSubmit={handleOrderSubmit} className="mt-6 space-y-6">

                            {/* Sélecteur de Quantité */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">
                                    Quantité à commander ({selectedOffre.unite})
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setQuantiteCommande(prev => Math.max(1, prev - 1))}
                                        className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-lg transition-colors"
                                    >
                                        <FaMinus />
                                    </button>

                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedOffre.quantite_disponible}
                                        value={quantiteCommande}
                                        onChange={(e) => setQuantiteCommande(Number(e.target.value))}
                                        className="flex-grow text-center py-3 px-4 rounded-xl border border-gray-200 font-extrabold text-lg text-gray-900 outline-none focus:border-green-600 transition-colors"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setQuantiteCommande(prev => Math.min(selectedOffre.quantite_disponible, prev + 1))}
                                        className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-lg transition-colors"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            {/* Recapitualtif du Prix */}
                            <div className="bg-green-50/70 p-4 rounded-2xl border border-green-100 space-y-2">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Prix unitaire :</span>
                                    <strong className="text-gray-900">{Number(selectedOffre.prix_unitaire).toLocaleString("fr-FR")} FCFA / {selectedOffre.unite}</strong>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Quantité sélectionnée :</span>
                                    <strong className="text-gray-900">{quantiteCommande} {selectedOffre.unite}</strong>
                                </div>
                                <div className="pt-2 border-t border-green-200 flex justify-between items-baseline">
                                    <span className="font-bold text-sm text-green-900">Total à payer :</span>
                                    <span className="text-xl font-black text-green-700">
                                        {(quantiteCommande * Number(selectedOffre.prix_unitaire)).toLocaleString("fr-FR")} FCFA
                                    </span>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOffre(null)}
                                    className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingCommande}
                                    className={`flex-1 py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
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
