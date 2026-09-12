import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import { useAuth } from "../../hooks/useAuth";
import {
    FaPlus, FaBox, FaShoppingBasket, FaMoneyBillWave,
    FaCheckCircle, FaExclamationCircle, FaTruck,
    FaTimesCircle, FaHourglassHalf, FaChevronDown,
    FaEdit, FaTrash, FaEye, FaExclamationTriangle
} from "react-icons/fa";
import { getOffres, deleteOffre } from "../../services/offreService";
import { getMesCommandes, updateStatutCommande } from "../../services/commandeService";

// Statuts autorisés par le backend
const STATUTS = [
    { value: "en_attente",  label: "En attente",         color: "amber" },
    { value: "confirmee",   label: "Confirmée",           color: "blue" },
    { value: "expediee",    label: "Expédiée",            color: "indigo" },
    { value: "livree",      label: "Livrée",              color: "emerald" },
    { value: "annulee",     label: "Annulée",             color: "red" },
];

function getStatusStyle(statut) {
    switch (statut) {
        case "en_attente":  return "bg-amber-50 text-amber-700 border-amber-200";
        case "confirmee":   return "bg-blue-50 text-blue-700 border-blue-200";
        case "expediee":    return "bg-indigo-50 text-indigo-700 border-indigo-200";
        case "livree":      return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "annulee":     return "bg-red-50 text-red-700 border-red-200";
        default:            return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

function getStatusIcon(statut) {
    switch (statut) {
        case "en_attente":  return <FaHourglassHalf />;
        case "confirmee":   return <FaCheckCircle />;
        case "expediee":    return <FaTruck />;
        case "livree":      return <FaCheckCircle />;
        case "annulee":     return <FaTimesCircle />;
        default:            return <FaHourglassHalf />;
    }
}

function getStatusLabel(statut) {
    return STATUTS.find(s => s.value === statut)?.label || statut;
}

export default function VendeurDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("commandes"); // "offres" | "commandes"

    // --- Offres ---
    const [offres, setOffres] = useState([]);
    const [loadingOffres, setLoadingOffres] = useState(true);

    // --- Commandes reçues ---
    const [commandes, setCommandes] = useState([]);
    const [loadingCommandes, setLoadingCommandes] = useState(true);

    // --- Mise à jour du statut commande ---
    const [updatingId, setUpdatingId] = useState(null);
    const [succesStatut, setSuccesStatut] = useState(null);
    const [erreurStatut, setErreurStatut] = useState(null);

    // --- Suppression d'offre ---
    const [offreASupprimer, setOffreASupprimer] = useState(null); // { id, nom }
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
            console.error("Erreur mise à jour statut :", err);
            const msg = err.response?.data?.message || "Erreur lors de la mise à jour du statut.";
            setErreurStatut(msg);
            setTimeout(() => setErreurStatut(null), 4000);
        } finally {
            setUpdatingId(null);
        }
    };

    // Calcul des stats
    const commandesEnAttente = commandes.filter(c => c.statut === "en_attente").length;
    const chiffreAffaires = commandes
        .filter(c => c.statut === "livree" || c.statut === "confirmee" || c.statut === "expediee")
        .reduce((sum, c) => sum + Number(c.prix_total || 0), 0);

    return (
        <>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            {/* En-tête */}
            <div className="bg-gradient-to-r from-green-900 via-green-800 to-green-700 text-white py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="px-3 py-1 bg-green-500/30 backdrop-blur-md border border-green-400/30 rounded-full text-xs font-bold uppercase tracking-wider text-green-200">
                            Espace Vendeur / Producteur
                        </span>
                        <h1 className="text-3xl font-extrabold mt-2">
                            Bonjour, {user?.nom || "Vendeur"} 👋
                        </h1>
                        <p className="text-green-100 text-sm mt-1">
                            Gérez vos offres et les commandes reçues de vos acheteurs B2B.
                        </p>
                    </div>

                    <Link
                        to="/vendeur/offres/creer"
                        className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-green-50 transition-all text-sm"
                    >
                        <FaPlus className="text-green-600" />
                        Publier une nouvelle offre
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">

                {/* Cartes de Statistiques */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">
                            <FaBox />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Offres publiées</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">{offres.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
                            <FaShoppingBasket />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Commandes reçues</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">
                                {commandes.length}
                                {commandesEnAttente > 0 && (
                                    <span className="ml-2 text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full align-middle">
                                        {commandesEnAttente} nouvelle{commandesEnAttente > 1 ? "s" : ""}
                                    </span>
                                )}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                            <FaMoneyBillWave />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Chiffre d'affaires</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">
                                {Number(chiffreAffaires).toLocaleString("fr-FR")} <span className="text-sm font-normal text-gray-500">FCFA</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Notifications flash */}
                {succesStatut && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-xl flex items-center gap-3">
                        <FaCheckCircle className="text-green-600" />
                        <p className="text-sm font-semibold text-green-800">{succesStatut}</p>
                    </div>
                )}
                {erreurStatut && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl flex items-center gap-3">
                        <FaExclamationCircle className="text-red-600" />
                        <p className="text-sm font-semibold text-red-800">{erreurStatut}</p>
                    </div>
                )}

                {/* Onglets */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-8">
                    <button
                        onClick={() => setActiveTab("commandes")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === "commandes"
                                ? "bg-white text-green-800 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <FaShoppingBasket />
                        Commandes reçues
                        {commandesEnAttente > 0 && (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                {commandesEnAttente}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("offres")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === "offres"
                                ? "bg-white text-green-800 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <FaBox />
                        Mes offres
                    </button>
                </div>

                {/* ===== ONGLET COMMANDES REÇUES ===== */}
                {activeTab === "commandes" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Commandes des acheteurs</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Changez le statut de chaque commande pour informer l'acheteur de l'avancement.
                            </p>
                        </div>

                        {loadingCommandes ? (
                            <div className="py-16 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3"></div>
                                <p className="text-xs text-gray-500 font-semibold">Chargement des commandes...</p>
                            </div>
                        ) : commandes.length === 0 ? (
                            <div className="py-16 px-6 text-center">
                                <p className="text-4xl mb-3">📦</p>
                                <h3 className="text-lg font-bold text-gray-800">Aucune commande reçue pour le moment</h3>
                                <p className="text-gray-500 text-sm mt-1">Les commandes passées par les acheteurs B2B apparaîtront ici.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                                            <th className="py-4 px-6">Commande</th>
                                            <th className="py-4 px-6">Acheteur</th>
                                            <th className="py-4 px-6">Produit commandé</th>
                                            <th className="py-4 px-6">Quantité</th>
                                            <th className="py-4 px-6">Montant</th>
                                            <th className="py-4 px-6">Statut actuel</th>
                                            <th className="py-4 px-6 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {commandes.map((cmd) => (
                                            <tr key={cmd.id} className="hover:bg-gray-50/70 transition-colors">
                                                {/* Numéro de commande */}
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-gray-900">#{cmd.id}</span>
                                                    <span className="block text-[11px] text-gray-400">
                                                        {new Date(cmd.date_commande || cmd.created_at).toLocaleDateString("fr-FR")}
                                                    </span>
                                                </td>

                                                {/* Acheteur */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-black">
                                                            {(cmd.acheteur?.nom || cmd.acheteur?.name || "A").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-gray-900 block text-xs">
                                                                {cmd.acheteur?.nom || cmd.acheteur?.name || "Acheteur"}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                {cmd.acheteur?.email || ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Produit */}
                                                <td className="py-4 px-6 font-semibold text-gray-800">
                                                    {cmd.offre?.nom || "Produit"}
                                                    <span className="block text-[11px] font-normal text-gray-400">
                                                        {cmd.offre?.categorie?.nom || ""}
                                                    </span>
                                                </td>

                                                {/* Quantité */}
                                                <td className="py-4 px-6 font-bold text-gray-700">
                                                    {cmd.quantite} {cmd.offre?.unite || ""}
                                                </td>

                                                {/* Montant */}
                                                <td className="py-4 px-6 font-black text-green-700">
                                                    {Number(cmd.prix_total).toLocaleString("fr-FR")} FCFA
                                                </td>

                                                {/* Statut actuel */}
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getStatusStyle(cmd.statut)}`}>
                                                        {getStatusIcon(cmd.statut)}
                                                        {getStatusLabel(cmd.statut)}
                                                    </span>
                                                </td>

                                                {/* Action : Changer le statut */}
                                                <td className="py-4 px-6 text-center">
                                                    {cmd.statut === "livree" || cmd.statut === "annulee" ? (
                                                        <span className="text-xs text-gray-400 font-medium italic">Terminée</span>
                                                    ) : (
                                                        <div className="relative inline-block">
                                                            <div className="flex items-center gap-1">
                                                                <select
                                                                    value={cmd.statut}
                                                                    disabled={updatingId === cmd.id}
                                                                    onChange={(e) => handleUpdateStatut(cmd.id, e.target.value)}
                                                                    className="appearance-none cursor-pointer text-xs font-bold py-2 pl-3 pr-8 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 outline-none hover:border-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                                >
                                                                    {STATUTS.map(s => (
                                                                        <option key={s.value} value={s.value}>
                                                                            {s.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] pointer-events-none" />
                                                            </div>
                                                            {updatingId === cmd.id && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== ONGLET MES OFFRES ===== */}
                {activeTab === "offres" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Mes produits & offres</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Liste de toutes vos offres publiées sur SenAgri</p>
                            </div>
                            <Link
                                to="/vendeur/offres/creer"
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                            >
                                <FaPlus /> Nouvelle offre
                            </Link>
                        </div>

                        {loadingOffres ? (
                            <div className="py-16 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3"></div>
                                <p className="text-xs text-gray-500 font-semibold">Chargement de vos offres...</p>
                            </div>
                        ) : offres.length === 0 ? (
                            <div className="py-16 px-6 text-center">
                                <p className="text-4xl mb-3">🌾</p>
                                <h3 className="text-lg font-bold text-gray-800">Aucune offre publiée</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">Commencez par publier vos récoltes et produits agricoles.</p>
                                <Link
                                    to="/vendeur/offres/creer"
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                                >
                                    <FaPlus /> Publier ma première offre
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                                            <th className="py-4 px-6">Produit</th>
                                            <th className="py-4 px-6">Prix unitaire</th>
                                            <th className="py-4 px-6">Stock disponible</th>
                                            <th className="py-4 px-6">Statut</th>
                                            <th className="py-4 px-6 text-right">Voir</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {offres.map((offre) => (
                                            <tr key={offre.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-900">
                                                    {offre.nom}
                                                    <span className="block text-xs font-normal text-gray-500">{offre.categorie?.nom || "Produit agricole"}</span>
                                                </td>
                                                <td className="py-4 px-6 font-semibold text-green-700">
                                                    {Number(offre.prix_unitaire || 0).toLocaleString("fr-FR")} FCFA / {offre.unite}
                                                </td>
                                                <td className="py-4 px-6 text-gray-700">
                                                    {offre.quantite_disponible} {offre.unite}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                        offre.est_disponible !== false
                                                            ? "bg-green-100 text-green-800 border-green-200"
                                                            : "bg-red-100 text-red-800 border-red-200"
                                                    }`}>
                                                        {offre.est_disponible !== false
                                                            ? <><FaCheckCircle className="text-[10px]" /> Disponible</>
                                                            : <><FaExclamationCircle className="text-[10px]" /> Épuisé</>
                                                        }
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/offres/${offre.id}`}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-green-700 bg-gray-100 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all"
                                                            title="Voir l'offre"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                        <Link
                                                            to={`/vendeur/offres/${offre.id}/modifier`}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-all"
                                                            title="Modifier l'offre"
                                                        >
                                                            <FaEdit />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOffreASupprimer({ id: offre.id, nom: offre.nom })}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 hover:border-red-300 transition-all"
                                                            title="Supprimer l'offre"
                                                        >
                                                            <FaTrash />
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
        </div>

        {/* ============================================================
            MODAL DE CONFIRMATION DE SUPPRESSION
        ============================================================ */}
        {offreASupprimer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl">
                            <FaExclamationTriangle />
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900">Supprimer cette offre ?</h3>
                        <p className="text-sm text-gray-600">
                            Vous êtes sur le point de supprimer définitivement l'offre
                            <strong className="text-gray-900 block mt-1">"{offreASupprimer.nom}"</strong>
                        </p>
                        <p className="text-xs text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 font-medium w-full">
                            ⚠️ Cette action est irréversible. Toutes les données liées à cette offre seront perdues.
                        </p>

                        <div className="flex gap-3 w-full pt-2">
                            <button
                                onClick={() => setOffreASupprimer(null)}
                                disabled={supprimant}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmSupprimer}
                                disabled={supprimant}
                                className={`flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${supprimant ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {supprimant ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Suppression...
                                    </>
                                ) : (
                                    <><FaTrash /> Oui, supprimer</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
    );
}
