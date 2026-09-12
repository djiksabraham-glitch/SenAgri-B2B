import { useEffect, useState } from "react";
import { getOffres } from "../../services/offreService";
import OffreCard from "../../components/offres/OffreCard";
import Navbar from "../../components/home/Navbar";
import { Link } from "react-router-dom";

export default function Offres() {
    const [offres, setOffres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const charger = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getOffres();
                setOffres(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Erreur chargement offres :", err);
                setError("Impossible de charger les offres. Vérifiez que le serveur Laravel est démarré.");
            } finally {
                setLoading(false);
            }
        };
        charger();
    }, []);

    const offresFiltrees = offres.filter((o) =>
        o.nom?.toLowerCase().includes(search.toLowerCase()) ||
        o.description?.toLowerCase().includes(search.toLowerCase()) ||
        o.categorie?.nom?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">

            <Navbar />

            {/* En-tête hero */}
            <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto">

                    {/* Fil d'ariane */}
                    <nav className="text-green-200 text-sm mb-4">
                        <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white font-medium">Offres</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-extrabold">
                        Les offres agricoles
                    </h1>
                    <p className="mt-3 text-green-100 text-lg max-w-2xl">
                        Découvrez les produits proposés par nos producteurs et vendeurs partout au Sénégal.
                    </p>

                    {/* Barre de recherche */}
                    <div className="mt-8 max-w-xl">
                        <div className="flex items-center bg-white rounded-xl shadow overflow-hidden">
                            <span className="pl-4 text-gray-400 text-xl">🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un produit, une catégorie..."
                                className="w-full px-4 py-3 text-gray-800 outline-none text-sm"
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* Contenu */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Chargement */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
                            <p className="text-gray-500 font-medium">Chargement des offres...</p>
                        </div>
                    )}

                    {/* Erreur */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center max-w-xl mx-auto">
                            <p className="font-bold text-lg mb-1">⚠️ Erreur de connexion</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Aucune offre */}
                    {!loading && !error && offresFiltrees.length === 0 && (
                        <div className="text-center py-24">
                            <p className="text-5xl mb-4">🌾</p>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {search ? "Aucun résultat trouvé" : "Aucune offre disponible"}
                            </h2>
                            <p className="text-gray-500 mt-2">
                                {search
                                    ? `Aucune offre ne correspond à « ${search} ».`
                                    : "Les producteurs n'ont pas encore publié d'offres."}
                            </p>
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="mt-5 px-5 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 transition-colors"
                                >
                                    Voir toutes les offres
                                </button>
                            )}
                        </div>
                    )}

                    {/* Liste des offres */}
                    {!loading && !error && offresFiltrees.length > 0 && (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-gray-600 text-sm">
                                    <span className="font-semibold text-gray-900">{offresFiltrees.length}</span> offre(s) disponible(s)
                                    {search && <span className="ml-1">pour « <span className="italic">{search}</span> »</span>}
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {offresFiltrees.map((offre) => (
                                    <OffreCard key={offre.id} offre={offre} />
                                ))}
                            </div>
                        </>
                    )}

                </div>
            </section>
        </div>
    );
}