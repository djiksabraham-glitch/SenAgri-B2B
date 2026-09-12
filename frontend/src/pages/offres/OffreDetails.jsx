import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getOffreById } from "../../services/offreService";
import { createCommande } from "../../services/commandeService";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/home/Navbar";
import { FaShoppingCart, FaCheckCircle, FaExclamationCircle, FaTimes, FaMinus, FaPlus, FaBox, FaCoins, FaCheck, FaDownload, FaComments } from "react-icons/fa";
import "./OffreDetails.css";

const getImageUrl = (img) => {
    if (!img) return "https://placehold.co/800x600?text=SenAgri";
    if (typeof img === "object" && img.url) return img.url;
    const path = typeof img === "object" ? (img.chemin_fichier || "") : img;
    if (!path) return "https://placehold.co/800x600?text=SenAgri";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const clean = path.replace(/^\//, "").replace(/^public\//, "");
    return clean.startsWith("storage/")
        ? `http://127.0.0.1:8000/${clean}`
        : `http://127.0.0.1:8000/storage/${clean}`;
};

export default function OffreDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [offre, setOffre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [imageActive, setImageActive] = useState(0);

    // Modal de Commande
    const [showModalCommande, setShowModalCommande] = useState(false);
    const [quantiteCommande, setQuantiteCommande] = useState(1);
    const [submittingCommande, setSubmittingCommande] = useState(false);
    const [erreurCommande, setErreurCommande] = useState("");
    const [succesCommande, setSuccesCommande] = useState(null);

    useEffect(() => {
        const chargerOffre = async () => {
            try {
                setLoading(true);
                setErreur("");
                const data = await getOffreById(id);
                console.log("Détail de l'offre :", data);
                setOffre(data);
            } catch (error) {
                console.error(error);
                setErreur("Impossible de récupérer les informations de cette offre.");
            } finally {
                setLoading(false);
            }
        };
        chargerOffre();
    }, [id]);

    const handleOpenCommandeModal = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        // Vérifier si l'utilisateur est le vendeur propriétaire de l'offre
        const isOwner = user && (user.id === offre.user_id || user.id === offre.vendeur?.id);
        if (isOwner) {
            setErreurCommande("Vous êtes le propriétaire de cette offre. Vous ne pouvez pas la commander.");
        } else {
            setErreurCommande("");
        }

        setQuantiteCommande(1);
        setSuccesCommande(null);
        setShowModalCommande(true);
    };

    const handleCalculTotal = () => {
        if (!offre) return 0;
        return Number(offre.prix_unitaire) * Number(quantiteCommande);
    };

    const handleQuantiteChange = (delta) => {
        const newQty = quantiteCommande + delta;
        if (newQty >= 1 && newQty <= (offre?.quantite_disponible || 1)) {
            setQuantiteCommande(newQty);
        }
    };

    const handleConfirmCommande = async (e) => {
        e.preventDefault();
        setSubmittingCommande(true);
        setErreurCommande("");

        try {
            const res = await createCommande({
                offre_id: Number(offre.id),
                quantite: Number(quantiteCommande),
            });

            console.log("Commande créée :", res);
            setSuccesCommande(res);

            // Mettre à jour la quantité disponible locale
            setOffre((prev) => ({
                ...prev,
                quantite_disponible: prev.quantite_disponible - quantiteCommande,
                est_disponible: (prev.quantite_disponible - quantiteCommande) > 0,
            }));

        } catch (err) {
            console.error("Erreur commande :", err);

            if (err.response && err.response.data?.message) {
                setErreurCommande(err.response.data.message);
            } else {
                setErreurCommande("Impossible d'enregistrer la commande. Veuillez réesayer.");
            }
        } finally {
            setSubmittingCommande(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="offre-details-loading">
                    <div className="details-spinner"></div>
                    <p>Chargement de l'offre...</p>
                </div>
            </>
        );
    }

    if (erreur || !offre) {
        return (
            <>
                <Navbar />
                <div className="offre-details-error">
                    <div>
                        <h2>Offre introuvable</h2>
                        <p>{erreur || "Cette offre n'existe pas."}</p>
                        <Link to="/offres" className="details-back-button">
                            ← Retour aux offres
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const images = offre.images || [];
    const categorie = offre.categorie?.nom || offre.categorie?.libelle || "Produit agricole";
    const vendeur = offre.vendeur?.name || offre.vendeur?.nom || offre.user?.name || "Vendeur SenAgri";
    const imagePrincipale = images.length > 0 ? getImageUrl(images[imageActive]) : "https://placehold.co/800x600?text=SenAgri";

    const isOwner = user && (user.id === offre.user_id || user.id === offre.vendeur?.id);

    return (
        <div className="offre-details-page min-h-screen flex flex-col justify-between">
            <Navbar />

            <main className="offre-details-container flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                
                {/* Breadcrumb */}
                <div className="details-breadcrumb">
                    <Link to="/">Accueil</Link>
                    <span>›</span>
                    <Link to="/offres">Offres</Link>
                    <span>›</span>
                    <span>{offre.nom}</span>
                </div>

                {/* Fiche Produit */}
                <section className="offre-details-card bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-10 mb-12">
                    
                    {/* Galerie */}
                    <div className="details-gallery">
                        <div className="details-main-image rounded-2xl overflow-hidden shadow-sm">
                            <img src={imagePrincipale} alt={offre.nom} />
                        </div>

                        {images.length > 0 && (
                            <div className="details-thumbnails flex gap-3 mt-4">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id || index}
                                        type="button"
                                        className={imageActive === index ? "detail-thumbnail active" : "detail-thumbnail"}
                                        onClick={() => setImageActive(index)}
                                    >
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`${offre.nom} ${index + 1}`}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600?text=SenAgri"; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Informations */}
                    <div className="details-information flex flex-col justify-between">
                        <div>
                            <span className="details-category inline-block px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full mb-3">
                                {categorie}
                            </span>

                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                                {offre.nom}
                            </h1>

                            <div className="details-price text-3xl font-black text-green-700 my-3">
                                {Number(offre.prix_unitaire).toLocaleString("fr-FR")} <span className="text-sm font-semibold text-gray-500">FCFA / {offre.unite}</span>
                            </div>

                            <div className="details-availability flex items-center gap-2 text-sm font-bold my-2">
                                {offre.est_disponible && offre.quantite_disponible > 0 ? (
                                    <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Stock disponible
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Épuisé / Indisponible
                                    </span>
                                )}
                            </div>

                            <div className="details-line border-b border-gray-100 my-4"></div>

                            <div className="space-y-3">
                                <div className="details-info-row flex justify-between text-sm py-1">
                                    <span className="text-gray-500">Quantité en stock</span>
                                    <strong className="text-gray-900 font-bold">{offre.quantite_disponible} {offre.unite}</strong>
                                </div>

                                <div className="details-info-row flex justify-between text-sm py-1">
                                    <span className="text-gray-500">Catégorie</span>
                                    <strong className="text-gray-900 font-bold">{categorie}</strong>
                                </div>

                                <div className="details-info-row flex justify-between text-sm py-1">
                                    <span className="text-gray-500">Vendeur / Producteur</span>
                                    <strong className="text-gray-900 font-bold">{vendeur}</strong>
                                </div>

                                {offre.date_publication && (
                                    <div className="details-info-row flex justify-between text-sm py-1">
                                        <span className="text-gray-500">Date de publication</span>
                                        <strong className="text-gray-900 font-bold">{new Date(offre.date_publication).toLocaleDateString("fr-FR")}</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="details-line border-b border-gray-100 my-6"></div>

                        {/* Actions de Commande & Contact */}
                        <div className="details-actions flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={handleOpenCommandeModal}
                                disabled={!offre.est_disponible || offre.quantite_disponible <= 0}
                                className={`flex-1 py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
                                    offre.est_disponible && offre.quantite_disponible > 0
                                        ? "bg-green-600 hover:bg-green-700 text-white hover:shadow-xl cursor-pointer"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                }`}
                            >
                                <FaShoppingCart className="text-xl" />
                                {isOwner ? "Votre offre (Propriétaire)" : "Commander cette récolte"}
                            </button>

                            {!isOwner && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            navigate("/login");
                                            return;
                                        }
                                        const targetId = offre.vendeur?.id || offre.user_id;
                                        if (targetId) {
                                            navigate(`/messages?user=${targetId}&offre=${offre.id}&vendeurNom=${encodeURIComponent(vendeur)}`);
                                        }
                                    }}
                                    className="flex-1 py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all shadow-sm cursor-pointer"
                                >
                                    <FaComments className="text-xl text-emerald-700" />
                                    Contacter le vendeur
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Description */}
                <section className="details-description bg-white rounded-3xl border border-gray-100 shadow-md p-8 mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description du produit</h2>
                    <p className="text-gray-600 leading-relaxed text-base">
                        {offre.description || "Aucune description détaillée disponible pour cette offre."}
                    </p>
                </section>

                {/* Retour */}
                <div className="details-return mb-8">
                    <Link to="/offres" className="text-sm font-bold text-green-700 hover:text-green-800 flex items-center gap-2">
                        ← Retour à toutes les offres
                    </Link>
                </div>

            </main>

            {/* =========================================================================
                MODAL DE PASSAGE DE COMMANDE B2B
            ========================================================================= */}
            {showModalCommande && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transition-all transform scale-100">
                        
                        {/* En-tête du Modal */}
                        <div className="bg-green-700 text-white px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaShoppingCart className="text-2xl" />
                                <div>
                                    <h3 className="text-lg font-bold">Passer une commande B2B</h3>
                                    <p className="text-xs text-green-100 font-medium">Validation directe auprès du vendeur</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModalCommande(false)}
                                className="text-green-100 hover:text-white bg-green-800/50 hover:bg-green-800 p-2 rounded-full transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Corps du Modal */}
                        <div className="p-6">
                            
                            {/* Résultat Succès */}
                            {succesCommande ? (
                                <div className="text-center py-6 space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                                        <FaCheck />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900">Commande Confirmée !</h4>
                                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                                        Votre commande pour <strong className="text-gray-900">{quantiteCommande} {offre.unite}</strong> de {offre.nom} a été enregistrée avec succès.
                                    </p>
                                    
                                    <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 my-4 space-y-2">
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>Montant total :</span>
                                            <strong className="text-green-700 font-extrabold text-sm">
                                                {Number(handleCalculTotal()).toLocaleString("fr-FR")} FCFA
                                            </strong>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>Statut :</span>
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 font-bold rounded-full text-[10px]">
                                                En attente de confirmation
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        <button
                                            onClick={() => navigate("/acheteur")}
                                            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-md"
                                        >
                                            Voir mes commandes dans mon espace
                                        </button>
                                        <button
                                            onClick={() => setShowModalCommande(false)}
                                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleConfirmCommande} className="space-y-6">
                                    
                                    {/* Résumé de l'offre */}
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <img
                                            src={imagePrincipale}
                                            alt={offre.nom}
                                            className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{offre.nom}</h4>
                                            <p className="text-xs text-gray-500">Vendeur: <span className="font-semibold text-gray-700">{vendeur}</span></p>
                                            <p className="text-xs font-black text-green-700 mt-1">
                                                {Number(offre.prix_unitaire).toLocaleString("fr-FR")} FCFA / {offre.unite}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Message d'erreur s'il y a lieu */}
                                    {erreurCommande && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl flex items-center gap-3">
                                            <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                                            <p className="text-xs font-semibold text-red-700">{erreurCommande}</p>
                                        </div>
                                    )}

                                    {/* Sélecteur de Quantité */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Quantité à commander ({offre.unite})
                                        </label>

                                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => handleQuantiteChange(-1)}
                                                disabled={quantiteCommande <= 1}
                                                className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <FaMinus className="text-xs" />
                                            </button>

                                            <div className="text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={offre.quantite_disponible}
                                                    value={quantiteCommande}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        if (val >= 1 && val <= offre.quantite_disponible) {
                                                            setQuantiteCommande(val);
                                                        }
                                                    }}
                                                    className="w-24 text-center font-black text-2xl text-gray-900 bg-transparent outline-none"
                                                />
                                                <span className="block text-[11px] font-bold text-gray-400">Max: {offre.quantite_disponible} {offre.unite}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleQuantiteChange(1)}
                                                disabled={quantiteCommande >= offre.quantite_disponible}
                                                className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <FaPlus className="text-xs" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Calculateur de Prix Total */}
                                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-green-800 uppercase tracking-wider block">Montant Total</span>
                                            <span className="text-xs text-green-600 font-medium">Hors frais de livraison</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-green-800">
                                                {Number(handleCalculTotal()).toLocaleString("fr-FR")}
                                            </span>
                                            <span className="text-xs font-bold text-green-700 ml-1">FCFA</span>
                                        </div>
                                    </div>

                                    {/* Action de Validation */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={submittingCommande || Boolean(erreurCommande)}
                                            className={`w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-2xl transition shadow-lg flex items-center justify-center gap-2 ${
                                                submittingCommande || Boolean(erreurCommande) ? "opacity-60 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {submittingCommande ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                                    Enregistrement de la commande...
                                                </>
                                            ) : (
                                                "Confirmer la commande"
                                            )}
                                        </button>
                                    </div>

                                </form>
                            )}

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}