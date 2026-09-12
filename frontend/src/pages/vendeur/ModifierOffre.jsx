import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import {
    getOffreById, getCategories, updateOffre, uploadImageOffre
} from "../../services/offreService";
import {
    FaArrowLeft, FaCloudUploadAlt, FaCheckCircle,
    FaExclamationTriangle, FaBox, FaTag, FaCoins, FaWeightHanging, FaTrash
} from "react-icons/fa";

export default function ModifierOffre() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingOffre, setLoadingOffre] = useState(true);

    const [formData, setFormData] = useState({
        nom: "",
        categorie_id: "",
        prix_unitaire: "",
        quantite_disponible: "",
        unite: "Kg",
        description: "",
        est_disponible: true,
    });

    // Images existantes (provenant de l'API)
    const [existingImages, setExistingImages] = useState([]);
    // Nouvelles images à uploader
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [erreurGenerale, setErreurGenerale] = useState("");
    const [erreursChamps, setErreursChamps] = useState({});
    const [succesMsg, setSuccesMsg] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [offre, cats] = await Promise.all([
                    getOffreById(id),
                    getCategories()
                ]);

                setCategories(cats);

                if (offre) {
                    setFormData({
                        nom: offre.nom || "",
                        categorie_id: offre.categorie?.id || offre.categorie_id || "",
                        prix_unitaire: offre.prix_unitaire || "",
                        quantite_disponible: offre.quantite_disponible || "",
                        unite: offre.unite || "Kg",
                        description: offre.description || "",
                        est_disponible: offre.est_disponible !== false,
                    });
                    setExistingImages(offre.images || []);
                }
            } catch (err) {
                console.error("Erreur lors du chargement de l'offre :", err);
                setErreurGenerale("Impossible de charger les données de l'offre.");
            } finally {
                setLoadingOffre(false);
                setLoadingCategories(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (erreursChamps[name]) {
            setErreursChamps((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const total = existingImages.length + selectedImages.length + files.length;
        if (total > 3) {
            setErreurGenerale(`Vous ne pouvez avoir que 3 photos au maximum. Il vous reste ${3 - existingImages.length - selectedImages.length} emplacement(s).`);
            return;
        }

        const newFiles = [...selectedImages, ...files].slice(0, 3 - existingImages.length);
        setSelectedImages(newFiles);
        setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
        setErreurGenerale("");
    };

    const handleRemoveNewImage = (index) => {
        const updated = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(updated);
        setImagePreviews(updated.map((f) => URL.createObjectURL(f)));
    };

    const getImageUrl = (img) => {
        if (!img) return "https://placehold.co/200x200?text=Photo";
        if (typeof img === "object" && img.url) return img.url;
        const path = typeof img === "object" ? (img.chemin_fichier || "") : img;
        if (!path) return "https://placehold.co/200x200?text=Photo";
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const clean = path.replace(/^\//, "").replace(/^public\//, "");
        return clean.startsWith("storage/")
            ? `http://127.0.0.1:8000/${clean}`
            : `http://127.0.0.1:8000/storage/${clean}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErreurGenerale("");
        setErreursChamps({});
        setSuccesMsg("");

        try {
            // 1. Mettre à jour les infos de l'offre
            await updateOffre(id, {
                nom: formData.nom,
                description: formData.description,
                prix_unitaire: Number(formData.prix_unitaire),
                quantite_disponible: Number(formData.quantite_disponible),
                unite: formData.unite,
                est_disponible: formData.est_disponible,
                categorie_id: Number(formData.categorie_id),
            });

            // 2. Uploader les nouvelles images si présentes
            if (selectedImages.length > 0) {
                const startOrder = existingImages.length + 1;
                for (let i = 0; i < selectedImages.length; i++) {
                    try {
                        await uploadImageOffre(id, selectedImages[i], startOrder + i);
                    } catch (imgErr) {
                        console.error(`Erreur upload image ${i + 1} :`, imgErr);
                    }
                }
            }

            setSuccesMsg("Votre offre a été modifiée avec succès !");
            setTimeout(() => navigate("/vendeur"), 1200);

        } catch (err) {
            console.error("Erreur modification offre :", err);

            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors || {};
                setErreursChamps(errors);
                const msgs = Object.values(errors).flat();
                setErreurGenerale(msgs.length > 0 ? msgs.join(" — ") : "Veuillez corriger les champs invalides.");
            } else if (err.response?.data?.message) {
                setErreurGenerale(err.response.data.message);
            } else {
                setErreurGenerale("Une erreur est survenue lors de la modification.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingOffre) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto">

                <Link
                    to="/vendeur"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700 mb-6 transition-colors"
                >
                    <FaArrowLeft /> Retour au tableau de bord
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12">

                    <div className="border-b border-gray-100 pb-6 mb-8">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-xs rounded-full uppercase tracking-wider">
                            Modifier l'Offre
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
                            Mettre à jour le produit
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Modifiez les informations de votre offre agricole ci-dessous.
                        </p>
                    </div>

                    {/* Alertes */}
                    {erreurGenerale && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-red-800">Erreur</h4>
                                <p className="text-xs text-red-700 font-medium mt-1">{erreurGenerale}</p>
                            </div>
                        </div>
                    )}

                    {succesMsg && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center gap-3">
                            <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                            <p className="text-sm font-semibold text-green-800">{succesMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Photos existantes + ajout de nouvelles */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-bold text-gray-800">
                                    Photos du produit
                                </label>
                                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                    {existingImages.length + selectedImages.length} / 3 photo(s)
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {/* Photos déjà enregistrées (lecture seule) */}
                                {existingImages.map((img, index) => (
                                    <div key={img.id || index} className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-40 bg-gray-100">
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`Photo existante ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = "https://placehold.co/200x200?text=Photo"; }}
                                        />
                                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            Photo {index + 1} {index === 0 ? "(Principale)" : ""}
                                        </span>
                                    </div>
                                ))}

                                {/* Nouvelles photos sélectionnées */}
                                {imagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative rounded-2xl overflow-hidden border-2 border-blue-300 shadow-sm h-40 bg-gray-100">
                                        <img
                                            src={preview}
                                            alt={`Nouvelle photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            onClick={() => handleRemoveNewImage(index)}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-xl shadow-md cursor-pointer hover:bg-red-700 transition-colors"
                                        >
                                            <FaTrash className="text-xs" />
                                        </div>
                                        <span className="absolute bottom-2 left-2 bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            Nouvelle
                                        </span>
                                    </div>
                                ))}

                                {/* Bouton d'ajout s'il reste de la place */}
                                {existingImages.length + selectedImages.length < 3 && (
                                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 hover:border-green-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-green-50/20 transition-all p-4 text-center">
                                        <FaCloudUploadAlt className="text-3xl text-gray-400 mb-1" />
                                        <span className="text-xs font-bold text-green-700">Ajouter une photo</span>
                                        <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImagesChange}
                                            className="sr-only"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Disponibilité rapide */}
                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="est_disponible"
                                        checked={formData.est_disponible}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-600 rounded-full transition-colors"></div>
                                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all peer-checked:translate-x-5"></div>
                                </div>
                                <div>
                                    <span className="font-bold text-sm text-gray-800">
                                        {formData.est_disponible ? "Offre disponible" : "Offre indisponible (masquée)"}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        {formData.est_disponible ? "Visible et commandable par les acheteurs." : "Non visible dans le catalogue public."}
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Nom & Catégorie */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nom de l'offre <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaBox />
                                    </div>
                                    <input
                                        type="text"
                                        name="nom"
                                        required
                                        value={formData.nom}
                                        onChange={handleChange}
                                        placeholder="Ex: Oignons Frais de Podor"
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${erreursChamps.nom ? "border-red-400" : "border-gray-200 focus:border-green-600"}`}
                                    />
                                </div>
                                {erreursChamps.nom && <p className="text-xs text-red-600 mt-1">{erreursChamps.nom[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Catégorie <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaTag />
                                    </div>
                                    <select
                                        name="categorie_id"
                                        required
                                        value={formData.categorie_id}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-600 transition-colors bg-white"
                                    >
                                        {loadingCategories ? (
                                            <option value="">Chargement...</option>
                                        ) : (
                                            categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Prix, Quantité, Unité */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Prix unitaire (FCFA) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><FaCoins /></div>
                                    <input
                                        type="number"
                                        name="prix_unitaire"
                                        required
                                        min="1"
                                        value={formData.prix_unitaire}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${erreursChamps.prix_unitaire ? "border-red-400" : "border-gray-200 focus:border-green-600"}`}
                                    />
                                </div>
                                {erreursChamps.prix_unitaire && <p className="text-xs text-red-600 mt-1">{erreursChamps.prix_unitaire[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Quantité disponible <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><FaWeightHanging /></div>
                                    <input
                                        type="number"
                                        name="quantite_disponible"
                                        required
                                        min="0"
                                        value={formData.quantite_disponible}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${erreursChamps.quantite_disponible ? "border-red-400" : "border-gray-200 focus:border-green-600"}`}
                                    />
                                </div>
                                {erreursChamps.quantite_disponible && <p className="text-xs text-red-600 mt-1">{erreursChamps.quantite_disponible[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Unité de mesure <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="unite"
                                    required
                                    value={formData.unite}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-600 transition-colors bg-white"
                                >
                                    <option value="Kg">Kg (Kilogramme)</option>
                                    <option value="Sac (50kg)">Sac de 50kg</option>
                                    <option value="Tonne">Tonne</option>
                                    <option value="Litre">Litre</option>
                                    <option value="Caisse">Caisse</option>
                                    <option value="Unité">Unité</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                                <span className="text-xs text-gray-400 font-normal ml-1">(Au moins 10 caractères)</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                minLength={10}
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                className={`block w-full p-4 rounded-xl border text-sm outline-none transition-colors ${erreursChamps.description ? "border-red-400" : "border-gray-200 focus:border-green-600"}`}
                                placeholder="Décrivez votre produit..."
                            />
                            {erreursChamps.description && <p className="text-xs text-red-600 mt-1">{erreursChamps.description[0]}</p>}
                        </div>

                        {/* Boutons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-1 py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${submitting ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Enregistrer les modifications"
                                )}
                            </button>
                            <Link
                                to="/vendeur"
                                className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base rounded-xl transition-all flex items-center justify-center"
                            >
                                Annuler
                            </Link>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}
