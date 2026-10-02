import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";


export default function OffreCard({ offre }) {

    if (!offre) return null;

    const images = offre.images || [];
    const firstImage = images.length > 0 ? images[0] : (offre.image || offre.image_url || null);
    const image = getImageUrl(firstImage);

    const categorieNom = offre.categorie?.nom || "Produit agricole";
    const vendeurNom = offre.vendeur?.nom || "Producteur";
    const vendeurAdresse = offre.vendeur?.adresse || "Sénégal";

    return (
        <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between border border-gray-100">
            <div>
                <div className="relative overflow-hidden group">
                    <img
                        src={image}
                        alt={offre.nom || "Offre"}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x400?text=SenAgri";
                        }}
                    />
                    {offre.est_disponible !== undefined && (
                        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${
                            offre.est_disponible ? "bg-green-600" : "bg-red-500"
                        }`}>
                            {offre.est_disponible ? "Disponible" : "Épuisé"}
                        </span>
                    )}
                </div>

                <div className="p-5">
                    <span className="text-xs uppercase tracking-wider text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-md">
                        {categorieNom}
                    </span>

                    <h3 className="text-xl font-bold mt-3 text-gray-900 line-clamp-1">
                        {offre.nom}
                    </h3>

                    <p className="text-gray-600 mt-2 text-sm line-clamp-2 min-h-[2.5rem]">
                        {offre.description || "Aucune description fournie."}
                    </p>

                    <div className="mt-5">
                        <p className="text-2xl font-black text-green-700">
                            {Number(offre.prix_unitaire || 0).toLocaleString()} <span className="text-sm font-normal text-gray-600">FCFA</span>
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                            Stock : <span className="font-semibold text-gray-700">{offre.quantite_disponible} {offre.unite}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5">
                <hr className="my-4 border-gray-100"/>
                <div className="flex justify-between items-center">
                    <div className="truncate pr-2">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                            {vendeurNom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            📍 {vendeurAdresse}
                        </p>
                    </div>

                    <Link
                        to={`/offres/${offre.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors shadow-sm inline-flex items-center justify-center"
                    >
                        Voir
                    </Link>

                </div>
            </div>
        </div>
    );
}