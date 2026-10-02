import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    FaLeaf, FaPlus, FaBox, FaShoppingCart, FaMoneyBillWave,
    FaCheckCircle, FaExclamationCircle, FaTruck,
    FaTimesCircle, FaHourglassHalf, FaChevronDown,
    FaEdit, FaTrash, FaEye, FaExclamationTriangle,
    FaThLarge, FaRegCommentDots, FaChartBar, FaCog, FaSignOutAlt, FaBell, FaPlusCircle
} from "react-icons/fa";
import { getOffres, deleteOffre } from "../../services/offreService";
import { getMesCommandes, updateStatutCommande } from "../../services/commandeService";
import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";

const STATUTS = [
    { value: "en_attente", label: "En attente" },
    { value: "confirmee",  label: "Confirmée" },
    { value: "expediee",   label: "Expédiée" },
    { value: "livree",     label: "Livrée" },
    { value: "annulee",    label: "Annulée" },
];

function getStatusStyle(statut) {
    switch (statut) {
        case "en_attente": return "bg-[#fdeedc] text-[#d67e2a]";
        case "confirmee":  return "bg-[#e2f5f6] text-[#008f91]";
        case "expediee":   return "bg-[#e5e7fa] text-[#48539e]";
        case "livree":     return "bg-[#d8f5d8] text-[#1b851b]";
        case "annulee":    return "bg-red-100 text-red-800";
        default:           return "bg-gray-100 text-gray-800";
    }
}

function getStatusLabel(statut) {
    return STATUTS.find(s => s.value === statut)?.label || statut;
}

export default function VendeurDashboard() {
    const { user, confirmLogout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("vue-d-ensemble");

    const [offres, setOffres] = useState([]);
    const [loadingOffres, setLoadingOffres] = useState(true);
    const [commandes, setCommandes] = useState([]);
    const [loadingCommandes, setLoadingCommandes] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [succesStatut, setSuccesStatut] = useState(null);
    const [erreurStatut, setErreurStatut] = useState(null);
    const [offreASupprimer, setOffreASupprimer] = useState(null);
    const [supprimant, setSupprimant] = useState(false);

    useEffect(() => {
        const chargerOffres = async () => {
            try {
                setLoadingOffres(true);
                const data = await getOffres();
                const mesOffres = Array.isArray(data)
                    ? data.filter(o => o.vendeur?.id === user?.id || o.user_id === user?.id)
                    : [];
                setOffres(mesOffres);
            } catch (err) {
                console.error("Erreur chargement offres vendeur :", err);
            } finally {
                setLoadingOffres(false);
            }
        };

        const chargerCommandes = async () => {
            try {
                setLoadingCommandes(true);
                const data = await getMesCommandes();
                setCommandes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Erreur chargement commandes vendeur :", err);
            } finally {
                setLoadingCommandes(false);
            }
        };

        chargerOffres();
        chargerCommandes();
    }, [user]);

    const handleConfirmSupprimer = async () => {
        if (!offreASupprimer) return;
        setSupprimant(true);
        try {
            await deleteOffre(offreASupprimer.id);
            setOffres(prev => prev.filter(o => o.id !== offreASupprimer.id));
            setSuccesStatut(`L'offre "${offreASupprimer.nom}" a été supprimée.`);
            setTimeout(() => setSuccesStatut(null), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de la suppression.";
            setErreurStatut(msg);
            setTimeout(() => setErreurStatut(null), 4000);
        } finally {
            setSupprimant(false);
            setOffreASupprimer(null);
        }
    };

    const handleUpdateStatut = async (commandeId, newStatut) => {
        setUpdatingId(commandeId);
        setSuccesStatut(null);
        setErreurStatut(null);
        try {
            await updateStatutCommande(commandeId, newStatut);
            setCommandes(prev =>
                prev.map(c => c.id === commandeId ? { ...c, statut: newStatut } : c)
            );
            setSuccesStatut(`Commande #${commandeId} mise à jour : ${getStatusLabel(newStatut)}`);
            setTimeout(() => setSuccesStatut(null), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de la mise à jour.";
            setErreurStatut(msg);
            setTimeout(() => setErreurStatut(null), 4000);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleLogout = () => {
        confirmLogout();
    };

    const getImageUrl = (img) => {
        if (!img) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "V")}&background=138040&color=fff`;
        return resolveImageUrl(img, user?.nom || "V");
    };

    const commandesEnAttente = commandes.filter(c => c.statut === "en_attente").length;
    const chiffreAffaires = commandes
        .filter(c => ["livree", "confirmee", "expediee"].includes(c.statut))
        .reduce((sum, c) => sum + Number(c.prix_total || 0), 0);

    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">

            {/* ===== SIDEBAR ===== */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex-col justify-between hidden md:flex shrink-0">
                {/* Logo */}
                <div>
                    <div className="px-6 pt-6 pb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <FaLeaf className="text-[#138040] text-[26px]" />
                            <div>
                                <p className="text-[18px] font-extrabold text-[#138040] leading-none tracking-tight">SenAgri</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">Marché Agricole B2B</p>
                            </div>
                        </Link>
                    </div>

                    <div className="px-4">
                        <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Tableau de bord</p>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab("vue-d-ensemble")}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-all text-left ${
                                    activeTab === "vue-d-ensemble"
                                        ? "bg-[#138040] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                <FaThLarge className={`${activeTab === "vue-d-ensemble" ? "text-white/80" : "text-gray-400"} text-[14px] shrink-0`} /> Vue d'ensemble
                            </button>
                            <button
                                onClick={() => setActiveTab("offres")}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-all text-left ${
                                    activeTab === "offres"
                                        ? "bg-[#138040] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                <FaBox className={`${activeTab === "offres" ? "text-white/80" : "text-gray-400"} text-[14px] shrink-0`} /> Mes offres
                            </button>
                            <button
                                onClick={() => setActiveTab("commandes")}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-all text-left ${
                                    activeTab === "commandes"
                                        ? "bg-[#138040] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <FaShoppingCart className={`${activeTab === "commandes" ? "text-white/80" : "text-gray-400"} text-[14px] shrink-0`} /> Commandes
                                </span>
                                {commandesEnAttente > 0 ? (
                                    <span className={`${activeTab === "commandes" ? "bg-white text-[#138040]" : "bg-[#f08c35] text-white"} text-[9px] px-2 py-0.5 rounded-full font-black`}>
                                        {commandesEnAttente}
                                    </span>
                                ) : (
                                    <span className={`${activeTab === "commandes" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"} text-[9px] px-2 py-0.5 rounded-full font-black`}>
                                        {commandes.length}
                                    </span>
                                )}
                            </button>
                            <Link
                                to="/messages"
                                className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors"
                            >
                                <span className="flex items-center gap-3"><FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" /> Messagerie</span>
                                <span className="w-2 h-2 bg-[#f08c35] rounded-full"></span>
                            </Link>
                            <button
                                onClick={() => setActiveTab("statistiques")}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-all text-left ${
                                    activeTab === "statistiques"
                                        ? "bg-[#138040] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                <FaChartBar className={`${activeTab === "statistiques" ? "text-white/80" : "text-gray-400"} text-[14px] shrink-0`} /> Statistiques
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Bottom nav */}
                <div className="px-4 pb-6 border-t border-gray-100 pt-4 space-y-1">
                    <Link
                        to="/profil"
                        className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                    >
                        <FaCog className="text-gray-400 text-[14px] shrink-0" /> Paramètres
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 text-[#c0392b] hover:bg-red-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                        <FaSignOutAlt className="text-[#c0392b] text-[14px] shrink-0" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ===== MAIN ===== */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#e4f5ed] text-[#138040] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#138040] rounded-full inline-block"></span>
                            Sénégal • Campagne en cours
                        </span>
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="relative text-gray-500 hover:text-gray-800">
                            <FaBell className="text-xl" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f08c35] border-2 border-white rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-gray-900 leading-none">{user?.nom || "Vendeur"}</p>
                                <p className="text-[10px] font-bold text-[#b05a18] mt-0.5">Vendeur Certifié</p>
                            </div>
                            <img
                                src={getImageUrl(user?.photo_profil)}
                                alt="avatar"
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#e4f5ed]"
                            />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-8 max-w-[1080px] mx-auto">

                    {/* Intro */}
                    <div className="mb-8 flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-[#e4f5ed] text-[#138040] text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#138040] rounded-full"></span> ESPACE VENDEUR / PRODUCTEUR
                                </span>
                                <span className="text-[11px] text-gray-500 font-semibold">Zone Niayes & Vallée</span>
                            </div>
                            <h1 className="text-[30px] font-extrabold text-gray-900 mb-2 tracking-tight">
                                Bonjour, {user?.nom || "Vendeur"} 👋
                            </h1>
                            <p className="text-gray-500 text-[13px] font-medium max-w-lg leading-relaxed">
                                Gérez vos offres et les commandes reçues de vos acheteurs B2B dans les 14 régions du Sénégal.
                            </p>
                        </div>
                        <Link
                            to="/vendeur/offres/creer"
                            className="bg-[#138040] hover:bg-[#0e6530] text-white px-5 py-3 rounded-xl font-bold text-[13px] flex items-center gap-2 shadow-md whitespace-nowrap shrink-0 transition-all"
                        >
                            <FaPlusCircle className="text-[16px]" /> Publier une nouvelle offre
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                        <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative overflow-hidden">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gray-400 mb-1">Offres Publiées</p>
                            <div className="flex items-baseline gap-2 mb-1">
                                <h3 className="text-[36px] font-black text-gray-900 leading-none">{offres.length}</h3>
                                <span className="text-[12px] font-bold text-[#138040]">actives</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-semibold">Oignon, Pomme de terre, Tomate</p>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#eef7f8] text-[#1e999c] rounded-[12px] flex items-center justify-center text-[18px]">
                                <FaBox />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative overflow-hidden">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gray-400 mb-1">Commandes Reçues</p>
                            <div className="flex items-baseline gap-2 mb-1">
                                <h3 className="text-[36px] font-black text-gray-900 leading-none">{commandes.length}</h3>
                                <span className="text-[12px] font-bold text-[#b05a18]">à traiter</span>
                                {commandesEnAttente > 0 && (
                                    <span className="ml-1 bg-[#f08c35] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                        {commandesEnAttente} nouvelle
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-400 font-semibold">Clients grossistes & CHR</p>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#fdf2e9] text-[#d67e2a] rounded-[12px] flex items-center justify-center text-[18px]">
                                <FaShoppingCart />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative overflow-hidden">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gray-400 mb-1">Chiffre d'Affaires</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <h3 className="text-[28px] font-black text-[#138040] leading-none">
                                    {Number(chiffreAffaires).toLocaleString("fr-FR")}
                                </h3>
                                <span className="text-[13px] font-extrabold text-[#138040]">FCFA</span>
                            </div>
                            <p className="text-[11px] text-[#138040] font-bold flex items-center gap-1">
                                ↗ +24% vs campagne précédente
                            </p>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#e4f5ed] text-[#138040] rounded-[12px] flex items-center justify-center text-[18px]">
                                <FaMoneyBillWave />
                            </div>
                        </div>
                    </div>

                    {/* Tabs + filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-4">
                        <div className="flex bg-white rounded-full p-1 border border-gray-100 shadow-sm">
                            <button
                                onClick={() => setActiveTab("commandes")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold transition-all ${
                                    activeTab === "commandes" || activeTab === "vue-d-ensemble"
                                        ? "bg-[#f0faf5] text-[#138040] border border-[#d5eddf] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaShoppingCart className="text-[11px]" />
                                Commandes reçues
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                    activeTab === "commandes" || activeTab === "vue-d-ensemble" ? "bg-[#f08c35] text-white" : "bg-gray-200 text-gray-600"
                                }`}>{commandes.length}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("offres")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold transition-all ${
                                    activeTab === "offres"
                                        ? "bg-[#f0faf5] text-[#138040] border border-[#d5eddf] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaBox className="text-[11px]" />
                                Mes offres au catalogue
                                <span className="bg-gray-200 text-gray-600 text-[9px] font-black px-1.5 py-0.5 rounded-full">{offres.length}</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500">
                            Filtrer par statut :
                            <select className="bg-white border border-gray-200 rounded-[9px] px-3 py-2 outline-none font-bold text-[12px] shadow-sm cursor-pointer text-gray-700 hover:border-[#138040] transition-colors">
                                <option>Tous les statuts</option>
                                {STATUTS.map(s => <option key={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Flash notifications */}
                    {succesStatut && (
                        <div className="mb-5 bg-green-50 border border-green-200 p-3.5 rounded-xl flex items-center gap-3">
                            <FaCheckCircle className="text-green-600 shrink-0" />
                            <p className="text-[13px] font-bold text-green-800">{succesStatut}</p>
                        </div>
                    )}
                    {erreurStatut && (
                        <div className="mb-5 bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-center gap-3">
                            <FaExclamationCircle className="text-red-600 shrink-0" />
                            <p className="text-[13px] font-bold text-red-800">{erreurStatut}</p>
                        </div>
                    )}

                    {/* Table card */}
                    <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
                        <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-[18px] font-extrabold text-gray-900 mb-0.5">
                                    {activeTab === "offres" ? "Mes produits & offres" : "Commandes des acheteurs B2B"}
                                </h2>
                                <p className="text-[12px] text-gray-500 font-medium">
                                    {activeTab === "offres"
                                        ? "Liste de toutes vos offres publiées sur SenAgri."
                                        : "Changez le statut de chaque commande pour informer l'acheteur en direct de l'acheminement des récoltes."}
                                </p>
                            </div>
                            {activeTab !== "offres" && (
                                <span className="text-[10px] font-bold text-gray-400 hidden sm:block">Synchronisation temps réel</span>
                            )}
                        </div>

                        {/* ---- COMMANDES TAB ---- */}
                        {activeTab !== "offres" && (
                            <>
                                {loadingCommandes ? (
                                    <div className="py-16 text-center text-[12px] text-gray-400 font-semibold">Chargement des commandes...</div>
                                ) : commandes.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <p className="text-4xl mb-3">📦</p>
                                        <h3 className="text-[15px] font-bold text-gray-800">Aucune commande reçue</h3>
                                        <p className="text-gray-400 text-[12px] mt-1">Les commandes passées par les acheteurs B2B apparaîtront ici.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#f8f9fc] text-gray-400 font-extrabold uppercase text-[9px] tracking-[0.13em] border-b border-gray-100">
                                                    <th className="py-4 px-6">Réf. Commande</th>
                                                    <th className="py-4 px-6">Acheteur B2B</th>
                                                    <th className="py-4 px-6">Produit & Variété</th>
                                                    <th className="py-4 px-6">Volume</th>
                                                    <th className="py-4 px-6">Montant Total</th>
                                                    <th className="py-4 px-6 text-center">Statut Actuel</th>
                                                    <th className="py-4 px-6 text-center">Changer Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {commandes.map(cmd => (
                                                    <tr key={cmd.id} className="hover:bg-gray-50/40 transition-colors">
                                                        <td className="py-5 px-6 align-top">
                                                            <span className="font-extrabold text-[#138040] text-[13px]">#{cmd.id}</span>
                                                            <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">
                                                                {new Date(cmd.date_commande || cmd.created_at).toLocaleDateString("fr-FR")}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-6 align-top">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-[#e4f5ed] text-[#138040] flex items-center justify-center text-[10px] font-black shrink-0 uppercase">
                                                                    {(cmd.acheteur?.nom || "A").substring(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-gray-900 text-[12px] block">{cmd.acheteur?.nom || "Acheteur"}</span>
                                                                    <span className="text-[10px] text-gray-400 font-medium">{cmd.acheteur?.adresse || "Dakar"}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6 align-top">
                                                            <span className="bg-[#eef7f8] text-[#1e999c] text-[9px] font-black px-2 py-0.5 rounded-full inline-block mb-1">
                                                                {cmd.offre?.categorie?.nom || "Catégorie"}
                                                            </span>
                                                            <span className="font-bold text-gray-900 text-[13px] block">{cmd.offre?.nom || "Produit"}</span>
                                                        </td>
                                                        <td className="py-5 px-6 align-top">
                                                            <span className="font-bold text-gray-900 text-[13px] block">{cmd.quantite} {cmd.offre?.unite || ""}</span>
                                                        </td>
                                                        <td className="py-5 px-6 align-top">
                                                            <span className="font-black text-gray-900 text-[14px] block leading-tight">
                                                                {Number(cmd.prix_total).toLocaleString("fr-FR")}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-bold block">FCFA</span>
                                                        </td>
                                                        <td className="py-5 px-6 align-top text-center">
                                                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${getStatusStyle(cmd.statut)}`}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                                                                {getStatusLabel(cmd.statut)}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-6 align-top">
                                                            {cmd.statut === "livree" || cmd.statut === "annulee" ? (
                                                                <span className="text-[11px] text-gray-400 italic font-medium">Terminée</span>
                                                            ) : (
                                                                <div className="relative">
                                                                    <select
                                                                        value={cmd.statut}
                                                                        disabled={updatingId === cmd.id}
                                                                        onChange={e => handleUpdateStatut(cmd.id, e.target.value)}
                                                                        className="w-full appearance-none cursor-pointer text-[12px] font-bold py-2 pl-3 pr-8 rounded-[9px] bg-[#f8f9fc] border border-gray-200 text-gray-700 outline-none hover:bg-gray-100 focus:border-gray-300 transition-colors disabled:opacity-60"
                                                                    >
                                                                        {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                                    </select>
                                                                    <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] pointer-events-none" />
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ---- OFFRES TAB ---- */}
                        {activeTab === "offres" && (
                            <>
                                {loadingOffres ? (
                                    <div className="py-16 text-center text-[12px] text-gray-400 font-semibold">Chargement de vos offres...</div>
                                ) : offres.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <p className="text-4xl mb-3">🌾</p>
                                        <h3 className="text-[15px] font-bold text-gray-800">Aucune offre publiée</h3>
                                        <p className="text-gray-400 text-[12px] mt-1 mb-5">Commencez par publier vos récoltes et produits agricoles.</p>
                                        <Link to="/vendeur/offres/creer" className="inline-flex items-center gap-2 bg-[#138040] hover:bg-[#0e6530] text-white font-bold px-5 py-2.5 rounded-xl text-[13px] transition-all">
                                            <FaPlus /> Publier ma première offre
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#f8f9fc] text-gray-400 font-extrabold uppercase text-[9px] tracking-[0.13em] border-b border-gray-100">
                                                    <th className="py-4 px-6">Produit & Catégorie</th>
                                                    <th className="py-4 px-6">Prix unitaire</th>
                                                    <th className="py-4 px-6">Stock</th>
                                                    <th className="py-4 px-6 text-center">Statut</th>
                                                    <th className="py-4 px-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {offres.map(offre => (
                                                    <tr key={offre.id} className="hover:bg-gray-50/40 transition-colors">
                                                        <td className="py-5 px-6">
                                                            <span className="font-bold text-gray-900 text-[13px] block mb-1">{offre.nom}</span>
                                                            <span className="bg-[#eef7f8] text-[#1e999c] text-[9px] font-black px-2 py-0.5 rounded-full inline-block">{offre.categorie?.nom || "Produit agricole"}</span>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <span className="font-black text-gray-900 text-[14px] block">{Number(offre.prix_unitaire || 0).toLocaleString("fr-FR")}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold">FCFA / {offre.unite}</span>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <span className="text-gray-900 font-bold text-[13px]">{offre.quantite_disponible} {offre.unite}</span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${
                                                                offre.est_disponible !== false ? "bg-[#d8f5d8] text-[#1b851b]" : "bg-red-100 text-red-800"
                                                            }`}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                                {offre.est_disponible !== false ? "Disponible" : "Épuisé"}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Link to={`/offres/${offre.id}`} className="p-2 text-gray-400 hover:text-[#138040] hover:bg-[#e4f5ed] rounded-[8px] transition-colors">
                                                                    <FaEye className="text-[14px]" />
                                                                </Link>
                                                                <Link to={`/vendeur/offres/${offre.id}/modifier`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-[8px] transition-colors">
                                                                    <FaEdit className="text-[14px]" />
                                                                </Link>
                                                                <button onClick={() => setOffreASupprimer({ id: offre.id, nom: offre.nom })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-colors">
                                                                    <FaTrash className="text-[14px]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* ===== MODAL SUPPRESSION ===== */}
            {offreASupprimer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-gray-100">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl">
                                <FaExclamationTriangle />
                            </div>
                            <h3 className="text-[18px] font-extrabold text-gray-900">Supprimer cette offre ?</h3>
                            <p className="text-[13px] text-gray-600">
                                Vous êtes sur le point de supprimer définitivement l'offre
                                <strong className="text-gray-900 block mt-1">"{offreASupprimer.nom}"</strong>
                            </p>
                            <p className="text-[11px] text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 font-medium w-full">
                                ⚠️ Cette action est irréversible.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setOffreASupprimer(null)}
                                    disabled={supprimant}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-[13px]"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmSupprimer}
                                    disabled={supprimant}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {supprimant ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <><FaTrash /> Oui, supprimer</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
