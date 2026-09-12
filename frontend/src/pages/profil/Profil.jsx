import { useEffect, useState } from "react";
import Navbar from "../../components/home/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { getProfil, updateProfil, uploadPhotoProfil, deletePhotoProfil } from "../../services/profileService";
import {
    FaUser, FaCamera, FaTrashAlt, FaCheckCircle, FaExclamationCircle,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaSave, FaUserCheck
} from "react-icons/fa";

export default function Profil() {
    const { user, updateUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Form fields
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [telephone, setTelephone] = useState("");
    const [adresse, setAdresse] = useState("");
    const [photoUrl, setPhotoUrl] = useState(null);

    // Feedback messages
    const [succesMsg, setSuccesMsg] = useState("");
    const [erreurMsg, setErreurMsg] = useState("");

    // Formattage de l'URL de la photo
    const getFormattedPhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        const clean = url.replace(/^\//, "").replace(/^public\//, "");
        return clean.startsWith("storage/")
            ? `http://127.0.0.1:8000/${clean}`
            : `http://127.0.0.1:8000/storage/${clean}`;
    };

    // Charger les informations du profil depuis l'API
    const fetchProfilData = async () => {
        try {
            setLoading(true);
            const data = await getProfil();

            setNom(data.nom || user?.nom || "");
            setEmail(data.email || user?.email || "");
            setTelephone(data.telephone || user?.telephone || "");
            setAdresse(data.adresse || user?.adresse || "");

            const pUrl = data.photo?.url || user?.photo_url || user?.photo?.url;
            setPhotoUrl(pUrl ? getFormattedPhotoUrl(pUrl) : null);
        } catch (err) {
            console.error("Erreur chargement profil :", err);
            // Fallback sur user de authContext
            if (user) {
                setNom(user.nom || "");
                setEmail(user.email || "");
                setTelephone(user.telephone || "");
                setAdresse(user.adresse || "");
                const pUrl = user.photo_url || user.photo?.url;
                setPhotoUrl(pUrl ? getFormattedPhotoUrl(pUrl) : null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfilData();
    }, []);

    // Sauvegarde des modifications du formulaire
    const handleUpdateProfil = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccesMsg("");
        setErreurMsg("");

        try {
            const updated = await updateProfil({
                nom,
                telephone,
                adresse,
                email,
            });

            // Mettre à jour le contexte global AuthContext
            updateUser({
                nom: updated.nom,
                email: updated.email,
                telephone: updated.telephone,
                adresse: updated.adresse,
            });

            setSuccesMsg("Votre profil a été mis à jour avec succès !");
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur mise à jour profil :", err);
            const msg = err.response?.data?.message || "Impossible de mettre à jour votre profil.";
            setErreurMsg(msg);
        } finally {
            setSaving(false);
        }
    };

    // Gestion du téléversement de la photo
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErreurMsg("Veuillez sélectionner un fichier image valide.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErreurMsg("La taille de la photo ne doit pas dépasser 2 Mo.");
            return;
        }

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

            // Mettre à jour le contexte utilisateur avec la nouvelle photo
            updateUser({
                photo_url: formatted,
            });

            setSuccesMsg("Votre photo de profil a été mise à jour !");
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur photo profil :", err);
            const msg = err.response?.data?.message || "Erreur lors de l'envoi de la photo.";
            setErreurMsg(msg);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Supprimer la photo
    const handleDeletePhoto = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) return;

        setUploadingPhoto(true);
        setErreurMsg("");
        setSuccesMsg("");

        try {
            await deletePhotoProfil();
            setPhotoUrl(null);

            updateUser({
                photo_url: null,
            });

            setSuccesMsg("Photo de profil supprimée.");
            setTimeout(() => setSuccesMsg(""), 4000);
        } catch (err) {
            console.error("Erreur suppression photo :", err);
            setErreurMsg("Impossible de supprimer la photo de profil.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            {/* En-tête Profil */}
            <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* Conteneur Avatar Interactif */}
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full bg-white text-green-700 font-black text-3xl flex items-center justify-center border-4 border-white/90 shadow-xl overflow-hidden">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={nom}
                                    className="w-full h-full object-cover"
                                    onError={() => setPhotoUrl(null)}
                                />
                            ) : (
                                <span>{nom ? nom.charAt(0).toUpperCase() : <FaUser />}</span>
                            )}
                        </div>

                        {/* Bouton de changement de photo overlay */}
                        <label
                            htmlFor="photo-upload-input"
                            className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 border-2 border-white"
                            title="Changer la photo de profil"
                        >
                            <FaCamera className="text-xs" />
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

                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <h1 className="text-3xl font-black">{nom || "Utilisateur SenAgri"}</h1>
                            <span className="bg-emerald-500/30 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase border border-emerald-400/30">
                                {user?.role || "Membre"}
                            </span>
                        </div>
                        <p className="text-green-100 text-sm mt-1 flex items-center justify-center sm:justify-start gap-2">
                            <FaEnvelope className="text-xs text-green-300" /> {email}
                        </p>
                        {photoUrl && (
                            <button
                                onClick={handleDeletePhoto}
                                disabled={uploadingPhoto}
                                className="mt-3 text-xs font-semibold text-red-200 hover:text-red-100 flex items-center gap-1.5 transition-colors"
                            >
                                <FaTrashAlt className="text-xs" /> Supprimer ma photo
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Contenu Principal */}
            <main className="max-w-4xl mx-auto px-6 py-10 flex-grow w-full">

                {/* Notifications Flash */}
                {succesMsg && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
                        <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                        <p className="text-sm font-semibold text-green-800">{succesMsg}</p>
                    </div>
                )}

                {erreurMsg && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
                        <FaExclamationCircle className="text-red-500 text-lg flex-shrink-0" />
                        <p className="text-sm font-semibold text-red-700">{erreurMsg}</p>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-xs text-gray-500 font-semibold">Chargement de votre profil...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Formulaire de Modification (2 Colonnes) */}
                        <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-extrabold text-gray-900">Informations Personnelles</h2>
                                <p className="text-xs text-gray-500 mt-1">Mettez à jour vos coordonnées publiques et de livraison B2B.</p>
                            </div>

                            <form onSubmit={handleUpdateProfil} className="space-y-5">

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Nom complet
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <FaUser />
                                        </div>
                                        <input
                                            type="text"
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-green-600 focus:bg-white transition-all"
                                            placeholder="Votre nom et prénom"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Adresse Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <FaEnvelope />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-green-600 focus:bg-white transition-all"
                                            placeholder="adresse@domaine.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Téléphone (WhatsApp / Mobile)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <FaPhone />
                                        </div>
                                        <input
                                            type="text"
                                            value={telephone}
                                            onChange={(e) => setTelephone(e.target.value)}
                                            placeholder="Ex: 77 123 45 67"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-green-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Adresse / Region / Ville
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <input
                                            type="text"
                                            value={adresse}
                                            onChange={(e) => setAdresse(e.target.value)}
                                            placeholder="Ex: Saint-Louis, Senegal"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-green-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-3.5 px-6 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Enregistrer les modifications
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>

                        {/* Panneau Latéral Sécurité & Rôle */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                                        <FaShieldAlt />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-sm">Sécurité du Compte</h3>
                                        <p className="text-[11px] text-gray-400">Statut et privilèges</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-gray-500 font-semibold">Rôle plateforme :</span>
                                        <span className="font-bold text-green-700 capitalize bg-green-50 px-2.5 py-0.5 rounded-md">
                                            {user?.role || "Membre"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-gray-500 font-semibold">Statut compte :</span>
                                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                                            <FaUserCheck /> Actif
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-500 font-semibold">Authentification :</span>
                                        <span className="font-bold text-gray-800">Sanctum Token</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </main>
        </div>
    );
}
