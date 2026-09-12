import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import { getCategories, createOffre, uploadImageOffre } from "../../services/offreService";
import { FaArrowLeft, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaBox, FaTag, FaCoins, FaWeightHanging, FaTrash } from "react-icons/fa";

export default function CreerOffre() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState({
        nom: "",
        categorie_id: "",
        prix_unitaire: "",
        quantite_disponible: "",
        unite: "Kg",
        description: "",
        est_disponible: true,
    });

    // Support jusqu'à 3 images (fichiers + prévisualisations)
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
                if (cats && cats.length > 0) {
                    setFormData((prev) => ({ ...prev, categorie_id: cats[0].id }));
                }
            } catch (err) {
                console.error("Erreur chargement catégories :", err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCats();
    }, []);

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

    // Gestion de l'ajout d'images (3 max)
    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (selectedImages.length + files.length > 3) {
            setErreurGenerale("Une offre ne peut contenir que 3 photos maximum.");
            return;
        }

        const newFiles = [...selectedImages, ...files].slice(0, 3);
        setSelectedImages(newFiles);

        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
        setErreurGenerale("");
    };

    // Supprimer une image de la sélection
    const handleRemoveImage = (indexToRemove) => {
        const updatedFiles = selectedImages.filter((_, idx) => idx !== indexToRemove);
        setSelectedImages(updatedFiles);

        const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErreurGenerale("");
        setErreursChamps({});
        setSuccesMsg("");

        try {
            // 1. Créer l'offre
            const resOffre = await createOffre({
                ...formData,
                prix_unitaire: Number(formData.prix_unitaire),
                quantite_disponible: Number(formData.quantite_disponible),
                categorie_id: Number(formData.categorie_id),
            });

            console.log("Offre créée :", resOffre);
            const newOffreId = resOffre?.data?.id || resOffre?.id;

            // 2. Téléverser les photos (jusqu'à 3 images max)
            if (selectedImages.length > 0 && newOffreId) {
                for (let i = 0; i < selectedImages.length; i++) {
                    try {
                        await uploadImageOffre(newOffreId, selectedImages[i], i + 1);
                    } catch (imgErr) {
                        console.error(`Erreur lors de l'envoi de la photo ${i + 1} :`, imgErr);
                    }
                }
            }

            setSuccesMsg("Votre offre agricole a été publiée avec succès avec vos photos !");

            setTimeout(() => {
                navigate("/vendeur");
            }, 1500);

        } catch (err) {
            console.error("Erreur création offre :", err);

            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors || {};
                setErreursChamps(errors);
                
                // Extraire et afficher tous les messages d'erreur détaillés du backend
                const errorMessages = Object.values(errors).flat();
                setErreurGenerale(
                    errorMessages.length > 0
                        ? errorMessages.join(" — ")
                        : "Certains champs ne respectent pas les critères de validation."
                );
            } else if (err.response && err.response.data?.message) {
                setErreurGenerale(err.response.data.message);
            } else {
                setErreurGenerale("Erreur lors de la publication. Assurez-vous d'être bien connecté en tant que Vendeur.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto">
                
                {/* Bouton retour */}
                <Link
                    to="/vendeur"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700 mb-6 transition-colors"
                >
                    <FaArrowLeft /> Retour au tableau de bord
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12">
                    
                    <div className="border-b border-gray-100 pb-6 mb-8">
                        <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-full uppercase tracking-wider">
                            Nouvelle Offre
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
                            Publier un produit agricole
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Ajoutez jusqu'à 3 photos pour valoriser vos produits auprès des acheteurs.
                        </p>
                    </div>

                    {/* Messages d'alerte */}
                    {erreurGenerale && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-red-800">Erreur de validation</h4>
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
                        
                        {/* Section Photos du produit (Jusqu'à 3 photos) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-800">
                                    Photos du produit (Jusqu'à 3 photos)
                                </label>
                                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                    {selectedImages.length} / 3 photo(s)
                                </span>
                            </div>
                            
                            {/* Grille de prévisualisation */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-40 bg-gray-100">
                                        <img
                                            src={preview}
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-xl shadow-md cursor-pointer hover:bg-red-700 transition-colors"
                                             onClick={() => handleRemoveImage(index)}
                                             title="Supprimer cette photo">
                                            <FaTrash className="text-xs" />
                                        </div>
                                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            Photo {index + 1} {index === 0 ? "(Principale)" : ""}
                                        </span>
                                    </div>
                                ))}

                                {/* Bouton d'ajout s'il reste des emplacements */}
                                {selectedImages.length < 3 && (
                                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 hover:border-green-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-green-50/20 transition-all p-4 text-center">
                                        <FaCloudUploadAlt className="text-3xl text-gray-400 mb-1" />
                                        <span className="text-xs font-bold text-green-700">
                                            {selectedImages.length === 0 ? "Ajouter des photos" : "Ajouter une autre photo"}
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (Max 3)</span>
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

                        {/* Nom du produit & Catégorie */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nom de l'offre <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
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
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                            erreursChamps.nom ? "border-red-400 bg-red-50/20" : "border-gray-200 focus:border-green-600"
                                        }`}
                                    />
                                </div>
                                {erreursChamps.nom && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{erreursChamps.nom[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Catégorie <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaTag />
                                    </div>
                                    <select
                                        name="categorie_id"
                                        required
                                        value={formData.categorie_id}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-white ${
                                            erreursChamps.categorie_id ? "border-red-400 bg-red-50/20" : "border-gray-200 focus:border-green-600"
                                        }`}
                                    >
                                        {loadingCategories ? (
                                            <option value="">Chargement des catégories...</option>
                                        ) : categories.length === 0 ? (
                                            <option value="">Aucune catégorie disponible</option>
                                        ) : (
                                            categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.nom}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                {erreursChamps.categorie_id && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{erreursChamps.categorie_id[0]}</p>
                                )}
                            </div>
                        </div>

                        {/* Prix, Quantité et Unité */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Prix unitaire (FCFA) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaCoins />
                                    </div>
                                    <input
                                        type="number"
                                        name="prix_unitaire"
                                        required
                                        min="1"
                                        value={formData.prix_unitaire}
                                        onChange={handleChange}
                                        placeholder="Ex: 500"
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                            erreursChamps.prix_unitaire ? "border-red-400 bg-red-50/20" : "border-gray-200 focus:border-green-600"
                                        }`}
                                    />
                                </div>
                                {erreursChamps.prix_unitaire && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{erreursChamps.prix_unitaire[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Quantité disponible <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaWeightHanging />
                                    </div>
                                    <input
                                        type="number"
                                        name="quantite_disponible"
                                        required
                                        min="1"
                                        value={formData.quantite_disponible}
                                        onChange={handleChange}
                                        placeholder="Ex: 1000"
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                            erreursChamps.quantite_disponible ? "border-red-400 bg-red-50/20" : "border-gray-200 focus:border-green-600"
                                        }`}
                                    />
                                </div>
                                {erreursChamps.quantite_disponible && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{erreursChamps.quantite_disponible[0]}</p>
                                )}
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
                                    className={`block w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-white ${
                                        erreursChamps.unite ? "border-red-400 bg-red-50/20" : "border-gray-200 focus:border-green-600"
                                    }`}
                                >
                                    <option value="Kg">Kg (Kilogramme)</option>
                                    <option value="Sac (50kg)">Sac de 50kg</option>
                                    <option value="Tonne">Tonne</option>
                                    <option value="Litre">Litre</option>
                                    <option value="Caisse">Caisse</option>
                                    <option value="Unité">Unité</option>
                                </select>
                                {erreursChamps.unite && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{erreursChamps.unite[0]}</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Description détaillée du produit <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(Au moins 10 caractères)</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                minLength={10}
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Décrivez la qualité, l'origine, le mode de conservation ou les conditions de livraison..."
                                className={`block w-full p-4 rounded-xl border text-sm outline-none transition-colors ${
                                    erreursChamps.description ? "border-red-400 bg-red-50/20" : "border-gray-200 focus:border-green-600"
                                }`}
                            ></textarea>
                            {erreursChamps.description && (
                                <p className="text-xs text-red-600 font-medium mt-1">{erreursChamps.description[0]}</p>
                            )}
                        </div>

                        {/* Bouton de validation */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center ${
                                    submitting ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                        Publication de l'offre et des photos ({selectedImages.length})...
                                    </>
                                ) : (
                                    "Publier l'offre agricole"
                                )}
                            </button>
                        </div>

                    </form>

                </div>

            </main>
        </div>
    );
}
