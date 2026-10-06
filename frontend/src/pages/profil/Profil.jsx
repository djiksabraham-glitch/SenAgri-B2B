import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getProfil, updateProfil, uploadPhotoProfil, deletePhotoProfil, deleteAccount } from "../../services/profileService";
import {
    FaLeaf, FaUser, FaCamera, FaTrashAlt, FaCheckCircle, FaExclamationTriangle,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaSave, FaUserCheck,
    FaChartLine, FaTags, FaBox, FaShoppingBag, FaHistory, FaUsers,
    FaStore, FaShoppingCart, FaRegCommentDots, FaChartBar,
    FaCog, FaSignOutAlt, FaBell, FaArrowLeft, FaSearch, FaTimes, FaFileAlt,
} from "react-icons/fa";

import { getImageUrl } from "../../utils/imageUrl";

export default function Profil() {
    const navigate = useNavigate();
    const { user, updateUser, confirmLogout, logoutUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");

    // Form fields
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [telephone, setTelephone] = useState("");
    const [adresse, setAdresse] = useState("");
    const [photoUrl, setPhotoUrl] = useState(null);
    const [cguDate, setCguDate] = useState(null);

    // Feedback messages
    const [succesMsg, setSuccesMsg] = useState("");
    const [erreurMsg, setErreurMsg] = useState("");

    const getFormattedPhotoUrl = (url) => {
        if (!url) return null;
        return getImageUrl(url);
    };

    const fetchProfilData = async () => {
        try {
            setLoading(true);
            const data = await getProfil();
            setNom(data.nom || user?.nom || "");
            setEmail(data.email || user?.email || "");
            setTelephone(data.telephone || user?.telephone || "");
            setAdresse(data.adresse || user?.adresse || "");
            setCguDate(data.cgu_acceptees_le || user?.cgu_acceptees_le || null);
            const pUrl = data.photo?.url || user?.photo_url || user?.photo?.url;
            setPhotoUrl(pUrl ? getFormattedPhotoUrl(pUrl) : null);
        } catch (err) {
            console.error("Erreur chargement profil :", err);
            if (user) {
                setNom(user.nom || "");
                setEmail(user.email || "");
                setTelephone(user.telephone || "");
                setAdresse(user.adresse || "");
                setCguDate(user.cgu_acceptees_le || null);
                const pUrl = user.photo_url || user.photo?.url;
                setPhotoUrl(pUrl ? getFormattedPhotoUrl(pUrl) : null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfilData(); }, []);

    const handleUpdateProfil = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccesMsg("");
        setErreurMsg("");
        try {
            const updated = await updateProfil({ nom, telephone, adresse, email });
            updateUser({ nom: updated.nom, email: updated.email, telephone: updated.telephone, adresse: updated.adresse });
            setSuccesMsg("Votre profil a été mis à jour avec succès !");
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur mise à jour profil :", err);
            setErreurMsg(err.response?.data?.message || "Impossible de mettre à jour votre profil.");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { setErreurMsg("Veuillez sélectionner un fichier image valide."); return; }
        if (file.size > 2 * 1024 * 1024) { setErreurMsg("La taille de la photo ne doit pas dépasser 2 Mo."); return; }
        const formData = new FormData();
        formData.append("photo", file);
        setUploadingPhoto(true);
        setErreurMsg("");
        setSuccesMsg("");
        try {
            const res = await uploadPhotoProfil(formData);
            const newPhotoUrl = res.data?.url || res.data?.photo?.url || res.url;
            const formatted = getFormattedPhotoUrl(newPhotoUrl);
            setPhotoUrl(formatted);
            updateUser({ photo_url: formatted });
            setSuccesMsg("Votre photo de profil a été mise à jour !");
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur photo profil :", err);
            setErreurMsg(err.response?.data?.message || "Erreur lors de l'envoi de la photo.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) return;
        setUploadingPhoto(true);
        setErreurMsg("");
        setSuccesMsg("");
        try {
            await deletePhotoProfil();
            setPhotoUrl(null);
            updateUser({ photo_url: null });
            setSuccesMsg("Photo de profil supprimée.");
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur suppression photo :", err);
            setErreurMsg("Impossible de supprimer la photo de profil.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleLogout = () => {
        confirmLogout();
    };

    const handleOpenDeleteModal = () => {
        setDeleteConfirmationInput("");
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        if (!deletingAccount) {
            setShowDeleteModal(false);
            setDeleteConfirmationInput("");
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmationInput.trim() !== "SUPPRIMER") {
            setErreurMsg("Veuillez saisir exactement 'SUPPRIMER' pour confirmer la suppression définitive de votre compte.");
            return;
        }

        setDeletingAccount(true);
        setErreurMsg("");
        try {
            await deleteAccount();
            setShowDeleteModal(false);
            await logoutUser();
            navigate("/login");
        } catch (err) {
            console.error("Erreur suppression compte :", err);
            setErreurMsg(err.response?.data?.message || "Impossible de supprimer votre compte. Veuillez réessayer ultérieurement.");
            setShowDeleteModal(false);
        } finally {
            setDeletingAccount(false);
        }
    };

    const dashboardLink = user?.role === "admin" ? "/admin" : user?.role === "acheteur" ? "/acheteur" : "/vendeur";
    const isAdmin = user?.role === "admin";
    const isAcheteur = user?.role === "acheteur";

    // Format téléphone Sénégal
    const formatTelSn = (tel) => {
        if (!tel) return null;
        const digits = tel.replace(/\D/g, "");
        if (digits.length === 9) return `+221 ${digits.slice(0,2)} ${digits.slice(2,5)} ${digits.slice(5,7)} ${digits.slice(7)}`;
        return `+221 ${tel}`;
    };

    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">

            {/* ===== SIDEBAR ===== */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 h-full">
                <div>
                    {/* Logo SenAgri */}
                    <div className="px-6 pt-6 pb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <FaLeaf className="text-[#138040] text-[26px]" />
                            <div>
                                <p className="text-[18px] font-extrabold text-[#138040] leading-none tracking-tight">SenAgri</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">
                                    {isAdmin ? "Espace Administration" : "Marché Agricole B2B"}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation selon le rôle */}
                    {isAdmin ? (
                        /* ---- SIDEBAR ADMIN ---- */
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Tableau de Bord</p>
                            <nav className="space-y-1">
                                {[
                                    { key: "vue-d-ensemble", label: "Vue d'ensemble",    icon: <FaChartLine className="text-[14px] shrink-0" /> },
                                    { key: "categories",     label: "Catégories",         icon: <FaTags      className="text-[14px] shrink-0" /> },
                                    { key: "offres",         label: "Toutes les Offres",  icon: <FaBox       className="text-[14px] shrink-0" /> },
                                    { key: "commandes",      label: "Commandes",          icon: <FaShoppingBag className="text-[14px] shrink-0" /> },
                                    { key: "audit-logs",     label: "Journaux d'Audit",   icon: <FaHistory   className="text-[14px] shrink-0" /> },
                                    { key: "utilisateurs",   label: "Gestion Utilisateurs", icon: <FaUsers   className="text-[14px] shrink-0" /> },
                                ].map((item) => (
                                    <Link
                                        key={item.key}
                                        to={`/admin`}
                                        className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                    >
                                        <span className="text-gray-400">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    ) : isAcheteur ? (
                        /* ---- SIDEBAR ACHETEUR ---- */
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Espace Acheteur</p>
                            <nav className="space-y-1">
                                <Link to="/acheteur" className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                    <FaStore className="text-gray-400 text-[14px] shrink-0" /> Offres & Catalogue
                                </Link>
                                <Link to="/acheteur" className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                    <FaShoppingBag className="text-gray-400 text-[14px] shrink-0" /> Mes Commandes
                                </Link>
                                <Link to="/messages" className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors">
                                    <span className="flex items-center gap-3"><FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" /> Messagerie</span>
                                    <span className="w-2 h-2 bg-[#138040] rounded-full"></span>
                                </Link>
                            </nav>
                        </div>
                    ) : (
                        /* ---- SIDEBAR VENDEUR ---- */
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Tableau de bord</p>
                            <nav className="space-y-1">
                                <Link to="/vendeur" className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                    <FaChartLine className="text-gray-400 text-[14px] shrink-0" /> Vue d'ensemble
                                </Link>
                                <Link to="/vendeur" className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                    <FaBox className="text-gray-400 text-[14px] shrink-0" /> Mes offres
                                </Link>
                                <Link to="/vendeur" className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                    <FaShoppingCart className="text-gray-400 text-[14px] shrink-0" /> Commandes
                                </Link>
                                <Link to="/messages" className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors">
                                    <span className="flex items-center gap-3"><FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" /> Messagerie</span>
                                    <span className="w-2 h-2 bg-[#f08c35] rounded-full"></span>
                                </Link>
                                <Link to="/vendeur" className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                    <FaChartBar className="text-gray-400 text-[14px] shrink-0" /> Statistiques
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Bottom Nav — Paramètres Système actif */}
                <div className="px-4 pb-6 border-t border-gray-100 pt-4 space-y-1">
                    <button className="w-full flex items-center gap-3 bg-[#138040] text-white px-4 py-2.5 rounded-[12px] font-bold text-[12px] shadow-sm text-left">
                        <FaCog className="text-white/80 text-[14px] shrink-0" />
                        {isAdmin ? "Paramètres Système" : "Paramètres"}
                        {isAdmin && <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-[#c0392b] hover:bg-red-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                    >
                        <FaSignOutAlt className="text-[#c0392b] text-[14px] shrink-0" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-y-auto flex flex-col">

                {/* Sticky Header */}
                <header className="bg-white/80 backdrop-blur sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
                    <span className="bg-[#e4f5ed] text-[#138040] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#138040] rounded-full inline-block"></span>
                        {nom || user?.nom || "Utilisateur"} • {isAdmin ? "Opérationnel" : "Actif"}
                    </span>

                    {/* Search bar */}
                    <div className="flex-1 max-w-xs mx-6 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder={isAdmin ? "Rechercher lot, transaction, coopérative..." : "Rechercher..."}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#138040] focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                            <FaBell className="text-lg" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#f08c35] rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-gray-900 leading-none">{nom || user?.nom || "Utilisateur"}</p>
                                {isAdmin ? (
                                    <span className="text-[10px] font-black bg-[#138040] text-white px-2 py-0.5 rounded-full mt-0.5 inline-block uppercase tracking-wide">
                                        ADMINISTRATEUR
                                    </span>
                                ) : (
                                    <p className="text-[10px] font-bold text-[#b05a18] mt-0.5 capitalize">
                                        {user?.role === "vendeur" ? "Vendeur Certifié" : user?.role || "Membre"}
                                    </p>
                                )}
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-[#138040] text-white font-black flex items-center justify-center text-sm shadow overflow-hidden">
                                {photoUrl ? (
                                    <img src={photoUrl} alt={nom} className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} />
                                ) : (
                                    nom ? nom.charAt(0).toUpperCase() : "U"
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 max-w-[900px] mx-auto w-full">

                    {/* Breadcrumb / Back */}
                    <div className="flex items-center justify-between mb-6">
                        <Link
                            to={dashboardLink}
                            className="flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-[#138040] transition-colors"
                        >
                            <FaArrowLeft className="text-[11px]" /> Retour au tableau de bord
                        </Link>
                        <span className="text-[12px] font-bold text-gray-400">
                            Espace Personnel • <span className="text-[#138040]">Paramètres du Compte</span>
                        </span>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-[#eef3fb] border border-[#d6e4f7] rounded-[16px] px-6 py-4 mb-8 relative overflow-hidden">
                        <p className="text-[10px] font-extrabold text-[#5b7fb5] uppercase tracking-widest mb-1">Plateforme Nationale SenAgri</p>
                        <p className="text-[17px] font-extrabold text-[#1a2e50]">Gérez vos informations personnelles & vos coordonnées de contact</p>
                        {/* déco */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
                            <FaShieldAlt className="text-[80px] text-[#1a2e50]" />
                        </div>
                    </div>

                    {/* Alerts */}
                    {erreurMsg && (
                        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-[14px] flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 text-[16px] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[13px] font-bold text-red-800">Erreur</p>
                                <p className="text-[12px] text-red-700 mt-0.5 font-medium">{erreurMsg}</p>
                            </div>
                        </div>
                    )}
                    {succesMsg && (
                        <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-[14px] flex items-center gap-3">
                            <FaCheckCircle className="text-green-600 text-[16px] shrink-0" />
                            <p className="text-[13px] font-bold text-green-800">{succesMsg}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-white rounded-[18px] p-12 border border-gray-100 text-center shadow-sm">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#138040] border-t-transparent mx-auto mb-3"></div>
                            <p className="text-xs text-gray-500 font-semibold">Chargement de votre profil...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">

                            {/* ——— Card Avatar & résumé ——— */}
                            <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 rounded-full bg-[#e4f5ed] border-[3px] border-[#138040]/30 shadow-md overflow-hidden flex items-center justify-center">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt={nom} className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} />
                                            ) : (
                                                <span className="text-2xl font-black text-[#138040]">
                                                    {nom ? nom.charAt(0).toUpperCase() : <FaUser />}
                                                </span>
                                            )}
                                        </div>
                                        {/* Bouton Camera */}
                                        <label
                                            htmlFor="photo-upload-input"
                                            className="absolute bottom-0 right-0 bg-[#138040] hover:bg-[#0e6530] text-white p-2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 border-2 border-white"
                                            title="Modifier la photo"
                                        >
                                            <FaCamera className="text-[11px]" />
                                            <input
                                                id="photo-upload-input"
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                                disabled={uploadingPhoto}
                                            />
                                        </label>
                                    </div>

                                    {/* Infos + boutons */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                            <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{nom || "Utilisateur SenAgri"}</h2>
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-gray-200">
                                                {isAdmin ? "ADMIN" : user?.role || "Membre"}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-[13px] font-medium flex items-center justify-center sm:justify-start gap-2 mb-3">
                                            <FaEnvelope className="text-[#138040] text-[11px]" /> {email}
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                            <label
                                                htmlFor="photo-upload-input"
                                                className="text-[11px] font-bold text-[#138040] bg-[#f0faf5] hover:bg-[#e4f5ed] border border-[#d5eddf] px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                                            >
                                                <FaCamera className="text-[10px]" />
                                                {uploadingPhoto ? "Téléversement..." : "Changer de photo"}
                                            </label>
                                            {photoUrl && (
                                                <button
                                                    onClick={handleDeletePhoto}
                                                    disabled={uploadingPhoto}
                                                    className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                                >
                                                    <FaTrashAlt className="text-[10px]" /> Supprimer la photo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bloc Hub (admin uniquement, comme la maquette) */}
                                    {isAdmin && adresse && (
                                        <div className="hidden sm:block text-right shrink-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hub Régional</p>
                                            <p className="font-extrabold text-gray-900 text-[15px]">{nom}</p>
                                            <p className="text-[#138040] text-[12px] font-bold">{adresse}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ——— Formulaire + Sécurité ——— */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                {/* Formulaire (2 cols) */}
                                <div className="md:col-span-2 bg-white rounded-[18px] border border-gray-100 shadow-sm p-8">
                                    <div className="pb-4 mb-6 border-b border-gray-50">
                                        <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">Informations Personnelles</h3>
                                        <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                                            Mettez à jour vos coordonnées pour vos transactions et livraisons B2B.
                                        </p>
                                    </div>

                                    <form onSubmit={handleUpdateProfil} className="space-y-5">
                                        {/* Nom complet */}
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                                Nom complet <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                                    <FaUser className="text-[14px]" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={nom}
                                                    onChange={(e) => setNom(e.target.value)}
                                                    required
                                                    placeholder="Votre nom et prénom"
                                                    className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-gray-200 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#138040] bg-white transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                                Adresse Email <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                                    <FaEnvelope className="text-[14px]" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder="adresse@domaine.com"
                                                    className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-gray-200 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#138040] bg-white transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Téléphone */}
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                                Téléphone (WhatsApp / Mobile)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                                    <FaPhone className="text-[14px]" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={telephone}
                                                    onChange={(e) => setTelephone(e.target.value)}
                                                    placeholder="Ex: 77 123 45 67"
                                                    className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-gray-200 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#138040] bg-white transition-colors"
                                                />
                                            </div>
                                            {telephone && (
                                                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                                                    Format local sénégalais : {formatTelSn(telephone)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Adresse */}
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                                Adresse / Région / Ville
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                                    <FaMapMarkerAlt className="text-[14px]" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={adresse}
                                                    onChange={(e) => setAdresse(e.target.value)}
                                                    placeholder="Ex: Dakar, Sénégal"
                                                    className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-gray-200 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#138040] bg-white transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Bouton submit */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full py-3.5 bg-[#138040] hover:bg-[#0e6530] text-white font-extrabold text-[14px] rounded-[14px] transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                        Enregistrement...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="text-white/80" /> Enregistrer les modifications
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Panneau Sécurité */}
                                <div className="space-y-5">
                                    <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-6 space-y-4">
                                        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                                            <div className="w-10 h-10 rounded-[12px] bg-[#e4f5ed] text-[#138040] flex items-center justify-center text-lg">
                                                <FaShieldAlt />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 text-[14px]">Sécurité du Compte</h4>
                                                <p className="text-[11px] text-gray-400 font-medium">Statut et privilèges</p>
                                            </div>
                                        </div>

                                        <div className="space-y-0 text-[12px]">
                                            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                                                <span className="text-gray-500 font-semibold">Rôle plateforme :</span>
                                                <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md capitalize">
                                                    {isAdmin ? "Admin" : user?.role || "Membre"}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                                                <span className="text-gray-500 font-semibold">Statut compte :</span>
                                                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                                                    <FaUserCheck className="text-[11px]" /> Actif
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                                                <span className="text-gray-500 font-semibold">Authentification :</span>
                                                <span className="font-bold text-gray-700 bg-gray-50 px-2.5 py-0.5 rounded-md">
                                                    Sanctum Token
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                                                <span className="text-gray-500 font-semibold">Consentement CGU :</span>
                                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                                    <FaUserCheck className="text-[11px]" />
                                                    {cguDate ? new Date(cguDate).toLocaleDateString('fr-FR') : "Accepté"}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2.5">
                                                <span className="text-gray-500 font-semibold">Protection données :</span>
                                                <span className="font-bold text-[11px] text-[#138040] bg-[#e4f5ed] px-2 py-0.5 rounded-md">
                                                    Loi 2008-12 & CDP
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Carte Protection des Données & Suppression */}
                                    <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-6 space-y-4">
                                        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                                            <div className="w-10 h-10 rounded-[12px] bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                                                <FaShieldAlt />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 text-[14px]">Vos Données (CDP)</h4>
                                                <p className="text-[11px] text-gray-400 font-medium">Droits & Confidentialité</p>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-gray-600 leading-relaxed">
                                            Conformément à la <strong>Loi n° 2008-12</strong> du 25 janvier 2008, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                                        </p>

                                        <div className="pt-1 flex flex-col gap-2 border-t border-gray-50">
                                            <Link
                                                to="/conditions-generales"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-bold text-[#138040] hover:text-[#0e6530] flex items-center gap-2 hover:underline"
                                            >
                                                <FaFileAlt className="text-gray-400 text-[10px]" /> Consulter les CGU
                                            </Link>
                                            <Link
                                                to="/politique-confidentialite"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-bold text-[#138040] hover:text-[#0e6530] flex items-center gap-2 hover:underline"
                                            >
                                                <FaShieldAlt className="text-gray-400 text-[10px]" /> Politique de Confidentialité
                                            </Link>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={handleOpenDeleteModal}
                                                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 font-bold text-[11px] rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <FaTrashAlt className="text-[10px]" /> Demander la suppression du compte
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* ——— Section Pôle Logistique (admin uniquement, ou tout le monde selon besoin) ——— */}
                            {isAdmin && (
                                <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-extrabold text-[#138040] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[#138040] rounded-full"></span>
                                                Pôle Logistique & Agroalimentaire
                                            </p>
                                            <h3 className="text-[20px] font-extrabold text-gray-900 mb-2">
                                                Marché d'Intérêt National<br />(MIN)
                                            </h3>
                                            <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-md">
                                                {adresse || "Dakar"} opère comme hub central de redistribution pour les récoltes en provenance des Niayes, de la Vallée du Fleuve et de la Casamance.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 shrink-0">
                                            <div className="bg-[#138040] text-white rounded-[14px] px-6 py-4 text-center min-w-[110px]">
                                                <p className="text-[20px] font-black">12 400 T</p>
                                                <p className="text-[10px] font-bold text-white/70 mt-0.5">Capacité Stock</p>
                                            </div>
                                            <div className="bg-[#138040] text-white rounded-[14px] px-6 py-4 text-center min-w-[110px]">
                                                <p className="text-[20px] font-black">24/24 h</p>
                                                <p className="text-[10px] font-bold text-white/70 mt-0.5">Quais Réfrigérés</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Confirmation de Suppression de Compte (Loi 2008-12 & CDP) */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-7 border border-gray-100 relative">
                        <button
                            type="button"
                            onClick={handleCloseDeleteModal}
                            disabled={deletingAccount}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100 shadow-sm">
                            <FaTrashAlt />
                        </div>

                        <h3 className="text-xl font-extrabold text-gray-900 text-center tracking-tight">
                            Suppression Définitive du Compte
                        </h3>

                        <p className="text-xs text-center text-gray-500 mt-1 mb-4">
                            Conformément à la <strong>Loi n° 2008-12</strong> & directives <strong>CDP</strong> (Sénégal)
                        </p>

                        <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 mb-5 text-left space-y-2">
                            <p className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                                <FaExclamationTriangle className="text-red-600 text-sm shrink-0" />
                                Attention : Cette action est irréversible !
                            </p>
                            <p className="text-[11px] text-red-800 leading-relaxed">
                                La suppression de votre compte entraînera l'effacement définitif de toutes vos données personnelles :
                            </p>
                            <ul className="text-[11px] text-red-700 list-disc pl-5 space-y-0.5">
                                <li>Votre profil (nom, email, téléphone, localisation, photo)</li>
                                <li>Vos offres publiées et produits enregistrés</li>
                                <li>Vos commandes et historiques de transactions</li>
                                <li>Vos messages et conversations avec les partenaires</li>
                                <li>Vos sessions et identifiants de connexion</li>
                            </ul>
                        </div>

                        <div className="mb-5 text-left">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Pour confirmer, veuillez saisir <span className="text-red-600 font-mono font-black">SUPPRIMER</span> ci-dessous :
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmationInput}
                                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                placeholder="Tapez SUPPRIMER"
                                disabled={deletingAccount}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold tracking-wider outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all uppercase"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                disabled={deletingAccount}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deletingAccount || deleteConfirmationInput.trim() !== "SUPPRIMER"}
                                className={`flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    deleteConfirmationInput.trim() !== "SUPPRIMER" || deletingAccount
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {deletingAccount ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <FaTrashAlt className="text-xs" /> Confirmer la suppression
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
