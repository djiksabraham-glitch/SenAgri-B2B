import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getOffreById } from "../../services/offreService";
import { createCommande } from "../../services/commandeService";
import { useAuth } from "../../hooks/useAuth";
import {
    FaLeaf, FaStore, FaShoppingBag, FaRegCommentDots, FaCog,
    FaSignOutAlt, FaBell, FaArrowLeft, FaShoppingCart, FaComments,
    FaCheckCircle, FaExclamationCircle, FaTimes, FaMinus, FaPlus,
    FaBox, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaTruck,
    FaShieldAlt, FaThLarge, FaChartBar, FaUserCheck, FaUserShield
} from "react-icons/fa";

import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";
import { getImageUrl } from "../../utils/imageUrl";

export default function OffreDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, confirmLogout, loading: authLoading } = useAuth();

    const [offre, setOffre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [imageActive, setImageActive] = useState(0);

    // Modal de Commande (pour utilisateurs connectés)
    const [showModalCommande, setShowModalCommande] = useState(false);
    const [quantiteCommande, setQuantiteCommande] = useState(1);
    const [submittingCommande, setSubmittingCommande] = useState(false);
    const [erreurCommande, setErreurCommande] = useState("");
    const [succesMsg, setSuccesMsg] = useState("");

    useEffect(() => {
        const chargerOffre = async () => {
            try {
                setLoading(true);
                setErreur("");
                const data = await getOffreById(id);
                setOffre(data);
            } catch (error) {
                console.error("Erreur chargement offre :", error);
                setErreur("Impossible de récupérer les informations de cette offre.");
            } finally {
                setLoading(false);
            }
        };
        chargerOffre();
    }, [id]);

    const handleLogout = () => {
        confirmLogout();
    };

    const handleOpenCommandeModal = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const isOwner = user && (user.id === offre?.user_id || user.id === offre?.vendeur?.id);
        if (isOwner) {
            setErreurCommande("Vous êtes le propriétaire de cette offre. Vous ne pouvez pas la commander.");
        } else {
            setErreurCommande("");
        }

        setQuantiteCommande(1);
        setShowModalCommande(true);
    };

    const handleConfirmCommande = async (e) => {
        e.preventDefault();
        if (!offre) return;

        if (quantiteCommande <= 0) {
            setErreurCommande("Veuillez sélectionner au moins 1 unité.");
            return;
        }

        if (quantiteCommande > offre.quantite_disponible) {
            setErreurCommande(`La quantité demandée dépasse le stock disponible (${offre.quantite_disponible} ${offre.unite}).`);
            return;
        }

        setSubmittingCommande(true);
        setErreurCommande("");

        try {
            await createCommande({
                offre_id: Number(offre.id),
                quantite: Number(quantiteCommande),
            });

            setSuccesMsg(`Commande enregistrée avec succès pour ${quantiteCommande} ${offre.unite} de ${offre.nom} !`);
            setShowModalCommande(false);

            // Mettre à jour la quantité locale disponible
            setOffre(prev => ({
                ...prev,
                quantite_disponible: prev.quantite_disponible - quantiteCommande,
                est_disponible: (prev.quantite_disponible - quantiteCommande) > 0,
            }));

            setTimeout(() => setSuccesMsg(""), 5000);
        } catch (err) {
            console.error("Erreur création commande :", err);
            const msg = err.response?.data?.message || "Impossible de passer cette commande pour le moment.";
            setErreurCommande(msg);
        } finally {
            setSubmittingCommande(false);
        }
    };

    const isOwner = user && offre && (user.id === offre.user_id || user.id === offre.vendeur?.id);
    const images = offre?.images || [];
    const categorie = offre?.categorie?.nom || offre?.categorie?.libelle || "Produit agricole";
    const vendeurNom = offre?.vendeur?.name || offre?.vendeur?.nom || offre?.user?.name || "Vendeur Certifié";
    const vendeurId = offre?.vendeur?.id || offre?.user_id;
    const vendeurAdresse = offre?.vendeur?.adresse || offre?.region || "Sénégal";
    const imagePrincipale = images.length > 0 ? getImageUrl(images[imageActive]) : getImageUrl(null);
    const stockDispo = offre ? Number(offre.quantite_disponible || 0) : 0;
    const isDispo = Boolean(offre?.est_disponible && stockDispo > 0);

    const dashboardLink = user?.role === "admin" ? "/admin" : user?.role === "vendeur" ? "/vendeur" : "/acheteur";
    const currentAvatar = user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "Utilisateur")}&background=138040&color=fff`;

    // Rendu du contenu commun de la fiche de l'offre
    const renderOffreContent = (isAuth) => {
        if (loading) {
            return (
                <div className="bg-white rounded-[20px] border border-gray-100 p-16 text-center shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#138040] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-[14px] font-bold text-gray-500">Chargement des détails de l'offre...</p>
                </div>
            );
        }

        if (erreur || !offre) {
            return (
                <div className="bg-white rounded-[20px] border border-gray-100 p-16 text-center shadow-sm">
                    <FaExclamationCircle className="text-4xl text-amber-500 mx-auto mb-3" />
                    <h2 className="text-[18px] font-black text-gray-900 mb-1">Offre introuvable</h2>
                    <p className="text-[13px] text-gray-500 mb-6">{erreur || "Cette offre agricole n'existe pas ou a été retirée."}</p>
                    <Link
                        to={isAuth ? dashboardLink : "/offres"}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#138040] text-white text-[12px] font-bold rounded-[12px] hover:bg-[#0e6530] transition shadow-sm"
                    >
                        <FaArrowLeft className="text-[11px]" /> Revenir au catalogue
                    </Link>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Notification de succès */}
                {succesMsg && (
                    <div className="bg-[#e4f5ed] border border-[#b8e2cd] p-4 rounded-[16px] flex items-center justify-between shadow-sm animate-fade-in">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-[#138040] text-lg shrink-0" />
                            <p className="text-[13px] font-extrabold text-[#0d592a]">{succesMsg}</p>
                        </div>
                        <button onClick={() => setSuccesMsg("")} className="text-[#0d592a] hover:text-black cursor-pointer">
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* ============================================================
                    CARTE PRINCIPALE DE L'OFFRE (2 COLONNES)
                ============================================================ */}
                <div className="bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* COLONNE GAUCHE : GALERIE D'IMAGES (5 cols) */}
                        <div className="lg:col-span-5 space-y-3">
                            <div className="relative rounded-[18px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm aspect-4/3 flex items-center justify-center">
                                <img
                                    src={imagePrincipale}
                                    alt={offre.nom}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
                                    }}
                                />
                                {/* Tag Catégorie */}
                                <span className="absolute top-3 left-3 bg-[#0d592a]/90 backdrop-blur text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                                    {categorie}
                                </span>
                                {/* Statut Stock */}
                                <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 backdrop-blur ${
                                    isDispo
                                        ? "bg-white/95 text-[#138040] border border-[#b8e2cd]"
                                        : "bg-red-50/95 text-red-600 border border-red-200"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isDispo ? "bg-[#138040] animate-pulse" : "bg-red-500"}`}></span>
                                    {isDispo ? "En stock" : "Rupture"}
                                </span>
                            </div>

                            {/* Miniatures si multiples images */}
                            {images.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-1">
                                    {images.map((img, idx) => (
                                        <button
                                            key={img.id || idx}
                                            type="button"
                                            onClick={() => setImageActive(idx)}
                                            className={`w-16 h-16 rounded-[12px] overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                                imageActive === idx
                                                    ? "border-[#138040] scale-102 shadow-xs"
                                                    : "border-gray-100 opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`${offre.nom} ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Badge de réassurance SenAgri */}
                            <div className="bg-[#f0faf5] rounded-[14px] p-3.5 border border-[#d5eddf] flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#138040] text-white flex items-center justify-center text-sm shrink-0">
                                    <FaShieldAlt />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-gray-900 leading-tight">Marché B2B Sécurisé SenAgri</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Contrôle qualité & facturation certifiée</p>
                                </div>
                            </div>
                        </div>

                        {/* COLONNE DROITE : INFORMATIONS & ACTIONS (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                            <div>
                                {/* Tag et titre */}
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-extrabold text-[#138040] uppercase tracking-wider bg-[#e4f5ed] px-2.5 py-0.5 rounded-full">
                                        {categorie}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-medium">
                                        Offre #{offre.id}
                                    </span>
                                </div>

                                <h1 className="text-[26px] font-black text-gray-900 tracking-tight leading-tight">
                                    {offre.nom}
                                </h1>

                                {/* Bloc Prix */}
                                <div className="mt-4 p-4 rounded-[16px] bg-[#f8f9fc] border border-gray-100 flex items-baseline justify-between">
                                    <div>
                                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                                            Prix unitaire B2B
                                        </span>
                                        <div className="flex items-baseline gap-2 mt-0.5">
                                            <span className="text-[30px] font-black text-[#138040] leading-none">
                                                {Number(offre.prix_unitaire).toLocaleString("fr-FR")}
                                            </span>
                                            <span className="text-[14px] font-extrabold text-gray-600">
                                                FCFA <span className="text-[12px] font-semibold text-gray-400">/ {offre.unite || "Unité"}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Disponibilité</span>
                                        <span className="text-[13px] font-black text-gray-900">
                                            {stockDispo} {offre.unite}
                                        </span>
                                    </div>
                                </div>

                                {/* Caractéristiques Clés (Grid) */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
                                    <div className="p-3 bg-white rounded-[14px] border border-gray-100">
                                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                                            <FaBox className="text-[#138040]" /> Stock Total
                                        </span>
                                        <p className="text-[13px] font-black text-gray-900 mt-1">
                                            {stockDispo} {offre.unite}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-white rounded-[14px] border border-gray-100">
                                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                                            <FaTag className="text-[#138040]" /> Catégorie
                                        </span>
                                        <p className="text-[13px] font-black text-gray-900 mt-1 truncate">
                                            {categorie}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-white rounded-[14px] border border-gray-100">
                                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                                            <FaMapMarkerAlt className="text-[#138040]" /> Origine
                                        </span>
                                        <p className="text-[13px] font-black text-gray-900 mt-1 truncate">
                                            {vendeurAdresse}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-white rounded-[14px] border border-gray-100">
                                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                                            <FaUserCheck className="text-[#138040]" /> Producteur
                                        </span>
                                        <p className="text-[13px] font-black text-gray-900 mt-1 truncate">
                                            {vendeurNom}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-white rounded-[14px] border border-gray-100">
                                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                                            <FaCalendarAlt className="text-[#138040]" /> Publication
                                        </span>
                                        <p className="text-[13px] font-black text-gray-900 mt-1">
                                            {offre.date_publication ? new Date(offre.date_publication).toLocaleDateString("fr-FR") : "Récente"}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-white rounded-[14px] border border-gray-100">
                                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                                            <FaTruck className="text-[#138040]" /> Expédition
                                        </span>
                                        <p className="text-[13px] font-black text-gray-900 mt-1 truncate">
                                            Direct Producteur
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions selon le statut de connexion */}
                            {!isAuth ? (
                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                    {/* Encadré d'incitation visiteur */}
                                    <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-[16px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#138040] text-white flex items-center justify-center shrink-0">
                                                <FaShoppingBag className="text-sm" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-gray-900 leading-tight">Vous souhaitez acheter ce produit ?</p>
                                                <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                                                    Connectez-vous ou créez votre compte gratuitement pour passer commande ou échanger avec le producteur.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                to="/login"
                                                className="px-4 py-2 bg-[#138040] hover:bg-[#0e6530] text-white text-[12px] font-bold rounded-[10px] transition-colors shadow-xs"
                                            >
                                                Connexion
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[12px] font-bold rounded-[10px] transition-colors"
                                            >
                                                S'inscrire
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Boutons d'action visiteur avec redirection */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/login")}
                                            disabled={!isDispo}
                                            className={`flex-1 py-3.5 px-6 rounded-[14px] font-extrabold text-[13px] flex items-center justify-center gap-2.5 transition-all shadow-sm ${
                                                isDispo
                                                    ? "bg-[#138040] hover:bg-[#0e6530] text-white cursor-pointer"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                            }`}
                                        >
                                            <FaShoppingCart className="text-[14px]" />
                                            Commander cette récolte
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate("/login")}
                                            className="flex-1 py-3.5 px-6 rounded-[14px] font-extrabold text-[13px] flex items-center justify-center gap-2.5 bg-[#f0faf5] hover:bg-[#e4f5ed] text-[#138040] border border-[#b8e2cd] transition-all cursor-pointer"
                                        >
                                            <FaComments className="text-[14px]" />
                                            Négocier / Contacter le producteur
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={handleOpenCommandeModal}
                                        disabled={!isDispo}
                                        className={`flex-1 py-3.5 px-6 rounded-[14px] font-extrabold text-[13px] flex items-center justify-center gap-2.5 transition-all shadow-sm ${
                                            isDispo
                                                ? "bg-[#138040] hover:bg-[#0e6530] text-white cursor-pointer"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                        }`}
                                    >
                                        <FaShoppingCart className="text-[14px]" />
                                        {isOwner ? "Votre offre (Propriétaire)" : "Commander cette récolte"}
                                    </button>

                                    {!isOwner && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (vendeurId) {
                                                    navigate(`/messages?user=${vendeurId}&offre=${offre.id}&vendeurNom=${encodeURIComponent(vendeurNom)}`);
                                                }
                                            }}
                                            className="flex-1 py-3.5 px-6 rounded-[14px] font-extrabold text-[13px] flex items-center justify-center gap-2.5 bg-[#f0faf5] hover:bg-[#e4f5ed] text-[#138040] border border-[#b8e2cd] transition-all cursor-pointer"
                                        >
                                            <FaComments className="text-[14px]" />
                                            Négocier / Contacter le producteur
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* ============================================================
                    DESCRIPTION DÉTAILLÉE DU PRODUIT
                ============================================================ */}
                <div className="bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-4">
                    <h3 className="text-[16px] font-black text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#138040]"></span>
                        Description détaillée du lot
                    </h3>
                    <div className="text-[13px] text-gray-600 leading-relaxed font-normal whitespace-pre-line bg-[#f8f9fc] p-5 rounded-[16px] border border-gray-100">
                        {offre.description || "Aucune description détaillée complémentaire fournie pour ce lot de récolte."}
                    </div>

                    {/* Profil Vendeur & Coordonnées */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#138040] text-white font-black flex items-center justify-center text-[13px] uppercase">
                                {(vendeurNom || "V").substring(0, 2)}
                            </div>
                            <div>
                                <p className="text-[13px] font-extrabold text-gray-900 leading-tight">{vendeurNom}</p>
                                <p className="text-[11px] text-gray-400 font-medium">Producteur certifié • {vendeurAdresse}</p>
                            </div>
                        </div>

                        {!isOwner && (
                            isAuth && vendeurId ? (
                                <Link
                                    to={`/messages?user=${vendeurId}&offre=${offre.id}&vendeurNom=${encodeURIComponent(vendeurNom)}`}
                                    className="inline-flex items-center gap-2 text-[12px] font-bold text-[#138040] bg-[#e4f5ed] hover:bg-[#d5eddf] px-4 py-2 rounded-[10px] transition-colors"
                                >
                                    <FaComments /> Échanger avec {vendeurNom}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="inline-flex items-center gap-2 text-[12px] font-bold text-[#138040] bg-[#e4f5ed] hover:bg-[#d5eddf] px-4 py-2 rounded-[10px] transition-colors cursor-pointer"
                                >
                                    <FaComments /> Échanger avec {vendeurNom}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Modal de Commande (uniquement pour utilisateurs connectés)
    const renderModalCommande = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-[22px] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 p-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-[17px] font-extrabold text-gray-900">Passer commande</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Confirmation directe auprès du vendeur</p>
                    </div>
                    <button
                        onClick={() => setShowModalCommande(false)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                </div>

                {/* Fiche récapitulative */}
                <div className="mt-4 flex items-center gap-3.5 bg-[#f8f9fc] p-3 rounded-[14px] border border-gray-100">
                    <img
                        src={imagePrincipale}
                        alt={offre.nom}
                        className="w-14 h-14 object-cover rounded-[10px]"
                    />
                    <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-extrabold text-[#138040] uppercase">{categorie}</span>
                        <h4 className="text-[13px] font-black text-gray-900 truncate">{offre.nom}</h4>
                        <p className="text-[11px] text-gray-500 font-medium">Stock : {stockDispo} {offre.unite}</p>
                    </div>
                </div>

                {erreurCommande && (
                    <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-[12px] flex items-center gap-2">
                        <FaExclamationCircle className="text-red-500 shrink-0 text-sm" />
                        <p className="text-[12px] font-bold text-red-700">{erreurCommande}</p>
                    </div>
                )}

                <form onSubmit={handleConfirmCommande} className="mt-5 space-y-5">
                    {/* Sélecteur de Quantité */}
                    <div>
                        <label className="block text-[12px] font-extrabold text-gray-800 mb-2">
                            Quantité à commander ({offre.unite})
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setQuantiteCommande(prev => Math.max(1, prev - 1))}
                                className="w-11 h-11 rounded-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                            >
                                <FaMinus className="text-xs" />
                            </button>
                            <input
                                type="number"
                                min="1"
                                max={stockDispo}
                                value={quantiteCommande}
                                onChange={(e) => setQuantiteCommande(Number(e.target.value))}
                                className="flex-grow text-center py-2.5 px-4 rounded-[12px] border border-gray-200 font-black text-lg text-gray-900 outline-none focus:border-[#138040] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setQuantiteCommande(prev => Math.min(stockDispo, prev + 1))}
                                className="w-11 h-11 rounded-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                            >
                                <FaPlus className="text-xs" />
                            </button>
                        </div>
                    </div>

                    {/* Récapitulatif Prix */}
                    <div className="bg-[#f0faf5] p-3.5 rounded-[14px] border border-[#d5eddf] space-y-1.5">
                        <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                            <span>Prix unitaire :</span>
                            <strong className="text-gray-900">{Number(offre.prix_unitaire).toLocaleString("fr-FR")} FCFA / {offre.unite}</strong>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                            <span>Quantité :</span>
                            <strong className="text-gray-900">{quantiteCommande} {offre.unite}</strong>
                        </div>
                        <div className="pt-2 border-t border-[#d5eddf] flex justify-between items-baseline">
                            <span className="font-extrabold text-[12px] text-gray-900">Total à payer :</span>
                            <span className="text-[18px] font-black text-[#138040]">
                                {(quantiteCommande * Number(offre.prix_unitaire)).toLocaleString("fr-FR")} FCFA
                            </span>
                        </div>
                    </div>

                    {/* Boutons d'Action */}
                    <div className="flex gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModalCommande(false)}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[12px] text-[12px] transition-colors cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submittingCommande || isOwner}
                            className={`flex-1 py-3 px-4 bg-[#138040] hover:bg-[#0e6530] text-white font-extrabold rounded-[12px] text-[12px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                                submittingCommande || isOwner ? "opacity-75 cursor-not-allowed" : ""
                            }`}
                        >
                            {submittingCommande ? (
                                <>
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                    <span>Validation...</span>
                                </>
                            ) : (
                                <>
                                    <FaShoppingCart className="text-[11px]" />
                                    <span>Confirmer</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#138040] border-t-transparent"></div>
            </div>
        );
    }

    // ============================================================
    // CAS 1 : VISITEUR NON CONNECTÉ (INTERFACE PUBLIQUE DÉDIÉE)
    // ============================================================
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] font-sans text-gray-800 flex flex-col justify-between">
                {/* Navbar publique complète */}
                <Navbar />

                {/* Contenu principal */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    {/* Fil d'ariane & Navigation retour */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <Link
                            to="/offres"
                            className="inline-flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-[#138040] transition-colors"
                        >
                            <FaArrowLeft className="text-[11px]" /> Retour au catalogue des offres
                        </Link>
                        <div className="text-[12px] font-bold text-gray-400">
                            <Link to="/" className="hover:text-gray-600">Accueil</Link>
                            <span className="mx-2">/</span>
                            <Link to="/offres" className="hover:text-gray-600">Offres</Link>
                            <span className="mx-2">/</span>
                            <span className="text-[#138040]">Fiche Produit #{id}</span>
                        </div>
                    </div>

                    {/* Détails de l'offre */}
                    {renderOffreContent(false)}
                </main>

                {/* Footer public */}
                <Footer />
            </div>
        );
    }

    // ============================================================
    // CAS 2 : UTILISATEUR CONNECTÉ (ESPACE DASHBOARD DU RÔLE)
    // ============================================================
    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">

            {/* ===== SIDEBAR PRINCIPALE ===== */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex-col justify-between hidden md:flex shrink-0">
                <div>
                    {/* Logo SenAgri */}
                    <div className="px-6 pt-6 pb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <FaLeaf className="text-[#138040] text-[26px]" />
                            <div>
                                <p className="text-[18px] font-extrabold text-[#138040] leading-none tracking-tight">SenAgri</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">Marché Agricole B2B</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation selon le rôle */}
                    {user?.role === "vendeur" ? (
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Tableau de bord</p>
                            <nav className="space-y-1">
                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaThLarge className="text-gray-400 text-[14px] shrink-0" /> Vue d'ensemble
                                </Link>

                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center gap-3 bg-[#138040] text-white px-4 py-2.5 rounded-[12px] font-bold text-[12px] shadow-sm transition-colors text-left"
                                >
                                    <FaBox className="text-white/80 text-[14px] shrink-0" /> Mes offres
                                </Link>

                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaShoppingCart className="text-gray-400 text-[14px] shrink-0" /> Commandes
                                    </span>
                                </Link>

                                <Link
                                    to="/messages"
                                    className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" /> Messagerie
                                    </span>
                                    <span className="w-2 h-2 bg-[#f08c35] rounded-full"></span>
                                </Link>

                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaChartBar className="text-gray-400 text-[14px] shrink-0" /> Statistiques
                                </Link>
                            </nav>
                        </div>
                    ) : user?.role === "admin" ? (
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Espace Admin</p>
                            <nav className="space-y-1">
                                <Link
                                    to="/admin"
                                    className="w-full flex items-center gap-3 bg-[#138040] text-white px-4 py-2.5 rounded-[12px] font-bold text-[12px] shadow-sm transition-colors text-left"
                                >
                                    <FaUserShield className="text-white/80 text-[14px] shrink-0" /> Administration
                                </Link>

                                <Link
                                    to="/offres"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaStore className="text-gray-400 text-[14px] shrink-0" /> Catalogue des offres
                                </Link>

                                <Link
                                    to="/messages"
                                    className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" /> Messagerie
                                    </span>
                                </Link>
                            </nav>
                        </div>
                    ) : (
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Espace Acheteur</p>
                            <nav className="space-y-1">
                                <Link
                                    to="/acheteur"
                                    className="w-full flex items-center gap-3 bg-[#138040] text-white px-4 py-2.5 rounded-[12px] font-bold text-[12px] shadow-sm transition-colors text-left"
                                >
                                    <FaStore className="text-white/80 text-[14px] shrink-0" /> Offres & Catalogue
                                </Link>

                                <Link
                                    to="/acheteur"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaShoppingBag className="text-gray-400 text-[14px] shrink-0" /> Mes Commandes
                                </Link>

                                <Link
                                    to="/messages"
                                    className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" /> Messagerie
                                    </span>
                                    <span className="w-2 h-2 bg-[#138040] rounded-full"></span>
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Bottom Nav */}
                <div className="px-4 pb-6 border-t border-gray-100 pt-4 space-y-1">
                    <Link
                        to="/profil"
                        className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                    >
                        <FaCog className="text-gray-400 text-[14px] shrink-0" /> Paramètres
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-[#c0392b] hover:bg-red-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left cursor-pointer"
                    >
                        <FaSignOutAlt className="text-[#c0392b] text-[14px] shrink-0" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ===== CONTENU PRINCIPAL DU DASHBOARD ===== */}
            <main className="flex-1 overflow-y-auto">
                {/* Sticky Header */}
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
                                <p className="text-[13px] font-bold text-gray-900 leading-none">{user?.nom || user?.name || "Mon Compte"}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 capitalize">
                                    {user?.role === "vendeur" ? "Vendeur Certifié" : user?.role === "admin" ? "Administrateur" : "Acheteur B2B / Grossiste"}
                                </p>
                            </div>
                            <img
                                src={currentAvatar}
                                alt="avatar"
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#e4f5ed]"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1240px] w-full mx-auto space-y-6">

                    {/* Navigation retour */}
                    <div className="flex items-center justify-between">
                        <Link
                            to={dashboardLink}
                            className="inline-flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-[#138040] transition-colors"
                        >
                            <FaArrowLeft className="text-[11px]" /> {user?.role === "vendeur" ? "Retour à mes offres" : user?.role === "admin" ? "Retour à l'administration" : "Retour au catalogue"}
                        </Link>
                        <div className="text-[12px] font-bold text-gray-400">
                            Catalogue National B2B • <span className="text-[#138040]">Fiche Produit #{id}</span>
                        </div>
                    </div>

                    {/* Détails de l'offre */}
                    {renderOffreContent(true)}

                </div>
            </main>

            {/* Modal de Commande */}
            {showModalCommande && offre && renderModalCommande()}

        </div>
    );
}