import { useEffect, useState } from "react";
import { getOffres } from "../../services/offreService";
import OffreCard from "./OffreCard";
import { Link } from "react-router-dom";

export default function DernieresOffres() {
    const [offres, setOffres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        getOffres()
            .then((data) => {
                console.log("OFFRES RECUES SUR L'ACCUEIL :", data);
                // Ensure data is array and take latest 6 offers
                const list = Array.isArray(data) ? data : [];
                setOffres(list.slice(0, 6));
            })
            .catch((err) => {
                console.error("ERREUR OFFRES :", err);
                setError("Impossible de charger les dernières offres pour le moment.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <span className="text-green-700 font-semibold text-sm uppercase tracking-wider bg-green-100 px-3 py-1 rounded-full">
                            Marché Agricole
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
                            Dernières offres disponibles
                        </h2>
                        <p className="text-gray-600 mt-2 max-w-xl">
                            Consultez les offres récentes de nos producteurs et achetez directement en ligne.
                        </p>
                    </div>

                    <Link
                        to="/offres"
                        className="mt-4 md:mt-0 inline-flex items-center text-green-700 font-bold hover:text-green-800 transition-colors"
                    >
                        Voir toutes les offres &rarr;
                    </Link>
                </div>

                {loading && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mb-3"></div>
                        <p className="text-gray-500 font-medium">Chargement des offres en cours...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
                        <p className="font-semibold">{error}</p>
                        <p className="text-sm mt-1 text-red-500">Vérifiez que votre serveur backend Laravel est en cours d'exécution.</p>
                    </div>
                )}

                {!loading && !error && offres.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800">Aucune offre disponible</h3>
                        <p className="text-gray-500 mt-2">Les producteurs n'ont pas encore publié d'offres.</p>
                    </div>
                )}

                {!loading && !error && offres.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offres.map((offre) => (
                            <OffreCard key={offre.id} offre={offre} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}