import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getCategories, createOffre, uploadImageOffre } from "../../services/offreService";
import { getMesCommandes } from "../../services/commandeService";
import {
    FaLeaf, FaArrowLeft, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle,
    FaBox, FaTag, FaCoins, FaWeightHanging, FaTrash,
    FaThLarge, FaShoppingCart, FaRegCommentDots, FaChartBar,
    FaCog, FaSignOutAlt, FaBell, FaPaperPlane, FaChevronDown
} from "react-icons/fa";

export default function CreerOffre() {
    const navigate = useNavigate();
    const { user, confirmLogout } = useAuth();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [commandesCount, setCommandesCount] = useState(0);

    const [formData, setFormData] = useState({
        nom: "",
        categorie_id: "",
        prix_unitaire: "",
        quantite_disponible: "",
        unite: "Kg",
        description: "",
        est_disponible: true,
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [erreurGenerale, setErreurGenerale] = useState("");
    const [erreursChamps, setErreursChamps] = useState({});
    const [succesMsg, setSuccesMsg] = useState("");

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Erreur chargement catégories :", err);
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchCommandes = async () => {
            try {
                const data = await getMesCommandes();
                if (Array.isArray(data)) {
                    const enAttente = data.filter(c => c.statut === "en_attente").length;
                    setCommandesCount(enAttente > 0 ? enAttente : 0);
                }
            } catch (err) {
                console.error("Erreur chargement commandes :", err);
            }
        };

        fetchCats();
        fetchCommandes();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (erreursChamps[name]) setErreursChamps(prev => ({ ...prev, [name]: null }));
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        if (selectedImages.length + files.length > 3) {
            setErreurGenerale("Une offre ne peut contenir que 3 photos maximum.");
            return;
        }
        const newFiles = [...selectedImages, ...files].slice(0, 3);
        setSelectedImages(newFiles);
        setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
        setErreurGenerale("");
    };

    const handleRemoveImage = (idx) => {
        const updated = selectedImages.filter((_, i) => i !== idx);
        setSelectedImages(updated);
        setImagePreviews(updated.map(f => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErreurGenerale("");
        setErreursChamps({});
        setSuccesMsg("");

        try {
            const resOffre = await createOffre({
                ...formData,
                prix_unitaire: Number(formData.prix_unitaire),
                quantite_disponible: Number(formData.quantite_disponible),
                categorie_id: Number(formData.categorie_id),
            });
            const newOffreId = resOffre?.data?.id || resOffre?.id;

            if (selectedImages.length > 0 && newOffreId) {
                for (let i = 0; i < selectedImages.length; i++) {
                    try { await uploadImageOffre(newOffreId, selectedImages[i], i + 1); }
                    catch (imgErr) { console.error(`Erreur photo ${i + 1}:`, imgErr); }
                }
            }

            setSuccesMsg("Votre offre agricole a été publiée avec succès !");
            setTimeout(() => navigate("/vendeur"), 1500);
        } catch (err) {
            if (err.response?.status === 422) {
                const errors = err.response.data.errors || {};
                setErreursChamps(errors);
                const msgs = Object.values(errors).flat();
                setErreurGenerale(msgs.length ? msgs.join(" — ") : "Certains champs sont invalides.");
            } else {
                setErreurGenerale(err.response?.data?.message || "Erreur lors de la publication.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        confirmLogout();
    };

    const getAvatarUrl = () => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "V")}&background=138040&color=fff`;
    };

    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">

            {/* ===== SIDEBAR ===== */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex-col justify-between hidden md:flex shrink-0">
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
                            <Link to="/vendeur" className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                <FaThLarge className="text-gray-400 text-[14px] shrink-0" /> Vue d'ensemble
                            </Link>
                            <Link to="/vendeur" className="w-full flex items-center gap-3 bg-[#f0faf5] text-[#138040] border border-[#d5eddf] px-4 py-2.5 rounded-[12px] font-bold text-[12px] text-left">
                                <FaBox className="text-[#138040] text-[14px] shrink-0" /> Mes offres
                            </Link>
                            <Link to="/vendeur" className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors">
                                <span className="flex items-center gap-3"><FaShoppingCart className="text-gray-400 text-[14px] shrink-0" /> Commandes</span>
                                {commandesCount > 0 && (
                                    <span className="bg-[#f08c35] text-white text-[9px] px-2 py-0.5 rounded-full font-black">{commandesCount}</span>
                                )}
                            </Link>
                            <button className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors">
                                <span className="flex items-center gap-3"><FaRegCommentDots className="text-gray-400 text-[14px] shrink-0" /> Messagerie</span>
                                <span className="w-2 h-2 bg-[#f08c35] rounded-full"></span>
                            </button>
                            <button className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                                <FaChartBar className="text-gray-400 text-[14px] shrink-0" /> Statistiques
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="px-4 pb-6 border-t border-gray-100 pt-4 space-y-1">
                    <button className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                        <FaCog className="text-gray-400 text-[14px] shrink-0" /> Paramètres
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 text-[#c0392b] hover:bg-red-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left">
                        <FaSignOutAlt className="text-[#c0392b] text-[14px] shrink-0" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ===== MAIN ===== */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b border-gray-100">
                    <span className="bg-[#e4f5ed] text-[#138040] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#138040] rounded-full inline-block"></span>
                        Sénégal • Campagne en cours
                    </span>
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
                            <img src={getAvatarUrl()} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-[#e4f5ed]" />
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[820px] mx-auto">

                    {/* Sub-header nav */}
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/vendeur" className="flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-[#138040] transition-colors">
                            <FaArrowLeft className="text-[11px]" /> Retour à mes offres
                        </Link>
                        <span className="text-[12px] font-bold text-gray-400">
                            Campagne agricole 2025/2026 • <span className="text-[#138040]">Mode Vendeur Actif</span>
                        </span>
                    </div>

                    {/* Bannière info */}
                    <div className="bg-[#eef3fb] border border-[#d6e4f7] rounded-[16px] px-6 py-4 mb-8">
                        <p className="text-[10px] font-extrabold text-[#5b7fb5] uppercase tracking-widest mb-1">Plateforme Nationale SenAgri</p>
                        <p className="text-[17px] font-extrabold text-[#1a2e50]">Mettez vos récoltes en relation directe avec les grossistes & coopératives</p>
                    </div>

                    {/* Alerts */}
                    {erreurGenerale && (
                        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-[14px] flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 text-[16px] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[13px] font-bold text-red-800">Erreur de validation</p>
                                <p className="text-[12px] text-red-700 mt-0.5 font-medium">{erreurGenerale}</p>
                            </div>
                        </div>
                    )}
                    {succesMsg && (
                        <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-[14px] flex items-center gap-3">
                            <FaCheckCircle className="text-green-600 text-[16px] shrink-0" />
                            <p className="text-[13px] font-bold text-green-800">{succesMsg}</p>
                        </div>
                    )}

                    {/* Form card */}
                    <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">

                        {/* Form header */}
                        <div className="px-8 pt-7 pb-6 border-b border-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="flex items-center gap-2 text-[10px] font-extrabold text-[#138040] uppercase tracking-widest bg-[#e4f5ed] border border-[#c7e8d5] px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-[#138040] rounded-full"></span> Nouvelle offre
                                </span>
                                <span className="text-[11px] font-bold text-gray-400">Formulaire certifié SenAgri Teranga</span>
                            </div>
                            <h1 className="text-[28px] font-extrabold text-gray-900 mb-2 tracking-tight">Publier un produit agricole</h1>
                            <p className="text-[13px] text-gray-500 font-medium">
                                Ajoutez jusqu'à 3 photos pour valoriser vos produits auprès des acheteurs et coopératives du Sénégal.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-8">

                            {/* Photos */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[13px] font-bold text-gray-800">
                                        Photos du produit <span className="text-gray-400 font-semibold">(Jusqu'à 3 photos)</span>
                                    </label>
                                    <span className="text-[11px] font-bold text-gray-500">{selectedImages.length} / 3 photo(s)</span>
                                </div>

                                {/* Grille prévisualisation + zone de drop */}
                                {imagePreviews.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative group rounded-[14px] overflow-hidden border border-gray-200 h-36 bg-gray-100">
                                                <img src={preview} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                                <div
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-2 right-2 bg-red-600/90 backdrop-blur text-white p-1.5 rounded-[8px] cursor-pointer hover:bg-red-700 transition-colors shadow-md"
                                                    title="Supprimer"
                                                >
                                                    <FaTrash className="text-[10px]" />
                                                </div>
                                                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                    Photo {idx + 1}{idx === 0 ? " · Principale" : ""}
                                                </span>
                                            </div>
                                        ))}
                                        {selectedImages.length < 3 && (
                                            <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 hover:border-[#138040] rounded-[14px] cursor-pointer hover:bg-[#f0faf5] transition-all">
                                                <FaCloudUploadAlt className="text-2xl text-gray-300 mb-1" />
                                                <span className="text-[11px] font-bold text-gray-400">Ajouter</span>
                                                <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="sr-only" />
                                            </label>
                                        )}
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-[180px] border-2 border-dashed border-gray-200 hover:border-[#138040] rounded-[16px] cursor-pointer hover:bg-[#f0faf5] transition-all bg-[#fafbfc]">
                                        <FaCloudUploadAlt className="text-[32px] text-[#138040]/60 mb-3" />
                                        <span className="text-[14px] font-bold text-[#138040]">Ajouter des photos</span>
                                        <span className="text-[12px] text-gray-400 mt-1 font-medium">Glissez-déposez vos fichiers ou parcourez votre appareil</span>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full">PNG, JPG, WEBP (Max 3)</span>
                                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full">Max 10 Mo par photo</span>
                                        </div>
                                        <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="sr-only" />
                                    </label>
                                )}
                            </div>

                            {/* Nom + Catégorie */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                        Nom de l'offre <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                            <FaBox className="text-[14px]" />
                                        </div>
                                        <input
                                            type="text"
                                            name="nom"
                                            required
                                            value={formData.nom}
                                            onChange={handleChange}
                                            placeholder="Ex: Oignons Frais de Podor"
                                            className={`w-full pl-10 pr-4 py-3 rounded-[12px] border text-[13px] outline-none transition-colors bg-white ${
                                                erreursChamps.nom
                                                    ? "border-red-400"
                                                    : "border-gray-200 focus:border-[#138040]"
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">Nom précis avec variété ou localité pour optimiser la recherche.</p>
                                    {erreursChamps.nom && <p className="text-[11px] text-red-600 font-bold mt-1">{erreursChamps.nom[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                        Catégorie <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                            <FaTag className="text-[14px]" />
                                        </div>
                                        <select
                                            name="categorie_id"
                                            required
                                            value={formData.categorie_id}
                                            onChange={handleChange}
                                            className={`w-full appearance-none pl-10 pr-10 py-3 rounded-[12px] border text-[13px] outline-none transition-colors bg-white cursor-pointer ${
                                                erreursChamps.categorie_id
                                                    ? "border-red-400"
                                                    : "border-gray-200 focus:border-[#138040]"
                                            }`}
                                        >
                                            <option value="">Sélectionner une filière agricole...</option>
                                            {loadingCategories ? (
                                                <option disabled>Chargement...</option>
                                            ) : (
                                                categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom}</option>)
                                            )}
                                        </select>
                                        <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">Détermine les acheteurs notifiés sur la bourse de commerce.</p>
                                    {erreursChamps.categorie_id && <p className="text-[11px] text-red-600 font-bold mt-1">{erreursChamps.categorie_id[0]}</p>}
                                </div>
                            </div>

                            {/* Prix, Quantité, Unité */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                        Prix unitaire (FCFA) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                            <FaCoins className="text-[14px]" />
                                        </div>
                                        <input
                                            type="number"
                                            name="prix_unitaire"
                                            required
                                            min="1"
                                            value={formData.prix_unitaire}
                                            onChange={handleChange}
                                            placeholder="Ex: 500"
                                            className={`w-full pl-10 pr-14 py-3 rounded-[12px] border text-[13px] outline-none transition-colors bg-white ${
                                                erreursChamps.prix_unitaire ? "border-red-400" : "border-gray-200 focus:border-[#138040]"
                                            }`}
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">FCFA</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">Montant net producteur conseillé.</p>
                                    {erreursChamps.prix_unitaire && <p className="text-[11px] text-red-600 font-bold mt-1">{erreursChamps.prix_unitaire[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                        Quantité disponible <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                            <FaWeightHanging className="text-[14px]" />
                                        </div>
                                        <input
                                            type="number"
                                            name="quantite_disponible"
                                            required
                                            min="1"
                                            value={formData.quantite_disponible}
                                            onChange={handleChange}
                                            placeholder="Ex: 1000"
                                            className={`w-full pl-10 pr-4 py-3 rounded-[12px] border text-[13px] outline-none transition-colors bg-white ${
                                                erreursChamps.quantite_disponible ? "border-red-400" : "border-gray-200 focus:border-[#138040]"
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">Stock actuellement prêt au champ/magasin.</p>
                                    {erreursChamps.quantite_disponible && <p className="text-[11px] text-red-600 font-bold mt-1">{erreursChamps.quantite_disponible[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-gray-800 mb-2">
                                        Unité de mesure <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                                            <FaBox className="text-[14px]" />
                                        </div>
                                        <select
                                            name="unite"
                                            required
                                            value={formData.unite}
                                            onChange={handleChange}
                                            className={`w-full appearance-none pl-10 pr-10 py-3 rounded-[12px] border text-[13px] outline-none bg-white cursor-pointer transition-colors ${
                                                erreursChamps.unite ? "border-red-400" : "border-gray-200 focus:border-[#138040]"
                                            }`}
                                        >
                                            <option value="Kg">Kg (Kilogramme)</option>
                                            <option value="Sac (50kg)">Sac de 50kg</option>
                                            <option value="Tonne">Tonne</option>
                                            <option value="Litre">Litre</option>
                                            <option value="Caisse">Caisse</option>
                                            <option value="Unité">Unité</option>
                                        </select>
                                        <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">Conditionnement standard de vente.</p>
                                    {erreursChamps.unite && <p className="text-[11px] text-red-600 font-bold mt-1">{erreursChamps.unite[0]}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[13px] font-bold text-gray-800">
                                        Description détaillée du produit <span className="text-red-500">*</span>{" "}
                                        <span className="text-gray-400 font-semibold">(Au moins 10 caractères)</span>
                                    </label>
                                    <span className="text-[11px] font-bold text-gray-400">{formData.description.length} caractère{formData.description.length !== 1 ? "s" : ""}</span>
                                </div>
                                <textarea
                                    name="description"
                                    required
                                    minLength={10}
                                    rows={6}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Décrivez la qualité, l'origine, le mode de conservation ou les conditions de livraison..."
                                    className={`w-full p-4 rounded-[12px] border text-[13px] outline-none transition-colors bg-white resize-y ${
                                        erreursChamps.description ? "border-red-400" : "border-gray-200 focus:border-[#138040]"
                                    }`}
                                />
                                {erreursChamps.description && <p className="text-[11px] text-red-600 font-bold mt-1">{erreursChamps.description[0]}</p>}
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-4 bg-[#138040] hover:bg-[#0e6530] text-white font-extrabold text-[15px] rounded-[14px] transition-all shadow-lg flex items-center justify-center gap-3 ${
                                        submitting ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            Publication en cours...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane className="text-white/80 text-[16px]" />
                                            Publier l'offre agricole
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[11px] text-gray-400 font-medium mt-3 flex items-center justify-center gap-2">
                                    <FaCheckCircle className="text-[#138040]/60 text-[12px]" />
                                    Votre offre sera soumise instantanément à notre réseau avec nos grossistes partenaires.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
